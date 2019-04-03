package com.step.train.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.step.train.configuration.Config;
import com.step.train.domain.entity.JsonResult;
import com.step.train.domain.entity.SsoUser;
import com.step.train.model.WechatQo;
import com.step.train.util.SymmetricEncoder;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.hibernate.usertype.UserType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.codec.Base64;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.transaction.SystemException;
import java.io.UnsupportedEncodingException;
import java.security.*;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

/**
 * Created by Administrator on 2/15/2019.
 */
@Service
public class WechatService {

    private static final Logger logger = LoggerFactory.getLogger(WechatService.class);

    @Autowired
    private UserService userService;

    @Autowired
    private Config config;

    public static boolean initialized = false;

    public SsoUser wxLogin(WechatQo req) throws Exception
    {
        //获取 session_key 和 openId
        String url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + config.getApp_id() + "&secret=" + config.getSecret() + "&js_code=" + req.getCode() + "&grant_type=authorization_code";
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.GET, null, String.class);
        if(responseEntity != null && responseEntity.getStatusCode() == HttpStatus.OK)
        {
            String sessionData = responseEntity.getBody();
            logger.info("sessionData = "+ sessionData);
            JSONObject jsonObj = JSON.parseObject(sessionData);
            String openId = jsonObj.getString("openid");
            String sessionKey = jsonObj.getString("session_key");

            //String signature = SHA1(req.getRawData()+sessionKey);
            /*if(!signature.equals(req.getSignature()))
            {
                logger.info(" req signature="+req.getSignature());
                logger.info(" java signature="+req.getSignature());
                throw new SystemException("ResponseMsg.WECHAT_LOGIN_SIGNATURE_ERROR");
            }*/

            if(StringUtils.isEmpty(openId)){
                throw new SystemException("未获取道openId");
            }

            //根据 openid 查询用户是否存在
            SsoUser user = userService.findByWechatOpenId(openId);
            if(user != null && user.getId() != null && user.getId() > 0){
                user.setTicket(sessionKey);
                return user;
            }
            //如果不存在,则走下面

            byte[] resultByte = null;
            try {
                resultByte = decrypt(Base64.decode(req.getEncryptedData().getBytes()), Base64.decode(sessionKey.getBytes()), Base64.decode(req.getIv().getBytes()));
            } catch (Exception e) {
                throw new SystemException("ResponseMsg.WECHAT_LOGIN_USER_ERROR");
            }
            if(null != resultByte && resultByte.length > 0)
            {
                String userInfoStr = "";
                try {
                    userInfoStr = new String(resultByte, "UTF-8");
                } catch (UnsupportedEncodingException e)
                {
                    logger.error(e.getMessage());
                }
                logger.info("userInfo = "+ userInfoStr);
                JSONObject u = JSON.parseObject(userInfoStr);


                user = new SsoUser();
                user.setId(0);
                user.setOrgId(0);
                user.setWechatOpenId(openId);
                user.setUpdatedUserId(0);
                user.setUserName("tmp:" + DigestUtils.md5DigestAsHex(UUID.randomUUID().toString().getBytes()));
                user.setRealName(u.getString("nickName"));
                user.setPhoto(u.getString("avatarUrl"));
                user.setSex(u.getByte("gender"));
                user.setStatus((byte) 1);
                user.setAddress(u.getString("country") + "," + u.getString("province") + "," + u.getString("city"));
                if(user.getRecommendUserId() == null || user.getRecommendUserId() == 0){
                    user.setRecommendUserId(req.getpId());
                }
                int result = userService.save(user);
                if(result > 0) {
                    user.setId(result);
                    return user;
                }
                return null;
            }else {
                throw new SystemException("ResponseMsg.WECHAT_LOGIN_USER_ERROR");
            }
        }else
        {
            throw new SystemException("ResponseMsg.WECHAT_LOGIN_CODE_ERROR");
        }
    }

    public static String SHA1(String str){
        try {
            //指定sha1算法
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            digest.update(str.getBytes());
            //获取字节数组
            byte messageDigest[] = digest.digest();
            // Create Hex String
            StringBuffer hexString = new StringBuffer();
            // 字节数组转换为 十六进制 数
            for (int i = 0; i < messageDigest.length; i++) {
                String shaHex = Integer.toHexString(messageDigest[i] & 0xFF);
                if (shaHex.length() < 2) {
                    hexString.append(0);
                }
                hexString.append(shaHex);
            }
            return hexString.toString().toLowerCase();

        } catch (NoSuchAlgorithmException e) {
            return "";
        }
    }



    private byte[] decrypt(byte[] content, byte[] keyByte, byte[] ivByte) throws InvalidAlgorithmParameterException {
        initialize();
        try {
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS7Padding");
            Key sKeySpec = new SecretKeySpec(keyByte, "AES");

            cipher.init(Cipher.DECRYPT_MODE, sKeySpec, generateIV(ivByte));// 初始化
            byte[] result = cipher.doFinal(content);
            return result;
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (NoSuchPaddingException e) {
            e.printStackTrace();
        } catch (InvalidKeyException e) {
            e.printStackTrace();
        } catch (IllegalBlockSizeException e) {
            e.printStackTrace();
        } catch (BadPaddingException e) {
            e.printStackTrace();
        } catch (NoSuchProviderException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }

    public static void initialize(){
        if (initialized) return;
        Security.addProvider(new BouncyCastleProvider());
        initialized = true;
    }
    //生成iv
    public static AlgorithmParameters generateIV(byte[] iv) throws Exception{
        AlgorithmParameters params = AlgorithmParameters.getInstance("AES");
        params.init(new IvParameterSpec(iv));
        return params;
    }


    /*
        //服务器第三方session有效时间，单位秒, 默认1天
        private static final Long EXPIRES = 86400L;

        private RestTemplate wxAuthRestTemplate = new RestTemplate();

        @Autowired
        private WechatAuthProperties wechatAuthProperties;

        @Autowired
        private StringRedisTemplate stringRedisTemplate;

        public WechatAuthenticationResponse wechatLogin(String code) {
            WechatAuthCodeResponse response = getWxSession(code);

            String wxOpenId = response.getOpenid();
            String wxSessionKey = response.getSessionKey();
            Consumer consumer = new Consumer();
            consumer.setWechatOpenid(wxOpenId);
            loginOrRegisterConsumer(consumer);

            Long expires = response.getExpiresIn();
            String thirdSession = create3rdSession(wxOpenId, wxSessionKey, expires);
            return new WechatAuthenticationResponse(thirdSession);
        }

        public WechatAuthCodeResponse getWxSession(String code) {
            LOGGER.info(code);
            String urlString = "?appid={appid}&secret={srcret}&js_code={code}&grant_type={grantType}";
            String response = wxAuthRestTemplate.getForObject(
                    wechatAuthProperties.getSessionHost() + urlString, String.class,
                    wechatAuthProperties.getAppId(),
                    wechatAuthProperties.getSecret(),
                    code,
                    wechatAuthProperties.getGrantType());
            ObjectMapper objectMapper = new ObjectMapper();
            ObjectReader reader = objectMapper.readerFor(WechatAuthCodeResponse.class);
            WechatAuthCodeResponse res;
            try {
                res = reader.readValue(response);
            } catch (IOException e) {
                res = null;
                LOGGER.error("反序列化失败", e);
            }
            LOGGER.info(response);
            if (null == res) {
                throw new RuntimeException("调用微信接口失败");
            }
            if (res.getErrcode() != null) {
                throw new RuntimeException(res.getErrmsg());
            }
            res.setExpiresIn(res.getExpiresIn() != null ? res.getExpiresIn() : EXPIRES);
            return res;
        }

        public String create3rdSession(String wxOpenId, String wxSessionKey, Long expires) {
            String thirdSessionKey = RandomStringUtils.randomAlphanumeric(64);
            StringBuffer sb = new StringBuffer();
            sb.append(wxSessionKey).append("#").append(wxOpenId);

            stringRedisTemplate.opsForValue().set(thirdSessionKey, sb.toString(), expires, TimeUnit.SECONDS);
            return thirdSessionKey;
        }

        private void loginOrRegisterConsumer(Consumer consumer) {
            Consumer consumer1 = consumerMapper.findConsumerByWechatOpenid(consumer.getWechatOpenid());
            if (null == consumer1) {
                consumerMapper.insertConsumer(consumer);
            }
        }

        public void updateConsumerInfo(Consumer consumer) {
            Consumer consumerExist = consumerMapper.findConsumerByWechatOpenid(AppContext.getCurrentUserWechatOpenId());
            consumerExist.setUpdatedBy(1L);
            consumerExist.setUpdatedAt(System.currentTimeMillis());
            consumerExist.setGender(consumer.getGender());
            consumerExist.setAvatarUrl(consumer.getAvatarUrl());
            consumerExist.setWechatOpenid(consumer.getWechatOpenid());
            consumerExist.setEmail(consumer.getEmail());
            consumerExist.setNickname(consumer.getNickname());
            consumerExist.setPhone(consumer.getPhone());
            consumerExist.setUsername(consumer.getUsername());
            consumerMapper.updateConsumer(consumerExist);
        }
    */

}
