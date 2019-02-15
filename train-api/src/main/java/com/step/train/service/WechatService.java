package com.step.train.service;

import com.step.train.domain.entity.SsoUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by Administrator on 2/15/2019.
 */
@Service
public class WechatService {

        private static final Logger LOGGER = LoggerFactory.getLogger(WechatService.class);

        @Autowired
        private SsoUser consumerMapper;

        /**
         * 服务器第三方session有效时间，单位秒, 默认1天
         */
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

}
