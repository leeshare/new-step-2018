package com.step.train.controller;


import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by lxl on 19/2/15.
 */
@RestController
@RequestMapping("/api/wx")
public class WxController {

    /*
    /**
	 * 调用微信接口获取用户的openid 及session_key
	 * @param req
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
    /*@DoAction
    public Response wXGameLogin(Request req,HttpServletRequest request,HttpServletResponse response) throws Exception{

        Response resp = new Response();

        JSONObject jsonObject = JSONObject.parseObject(req.getData().toString());

        String gameId = req.getGameId();

        String secret = WxGameConfig.getSecret(gameId);

        if(secret == null){
            resp.setRt(10);
            resp.setData("游戏ID不存在");
            return resp;
        }

        //获取code并调用微信接口
        String code = jsonObject.getString("code");

        String url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + gameId + "&secret="
                + secret + "&js_code=" + code + "&grant_type=authorization_code";

        jsonObject = AuthUtil.doGetJson(url);

        //获取openid
        String openid = jsonObject.getString("openid");
        System.out.println("openid="+openid);
        //获取session_key
        String sessionKey = jsonObject.getString("session_key");
        //System.out.println("sessionKey="+sessionKey);

        //String key = RandomStringTool.randomNum(32);

        //将sessionKey保存到Session中
        //request.getSession().setAttribute("sessionKey",sessionKey);

        resp.setData(openid+","+sessionKey);

        return resp;
    }



    /**
     * 群分享获取群ID
     * @param req
     * @param request
     * @param response
     * @return
     * @throws UnsupportedEncodingException 
     * @throws Exception 
     * @throws NoSuchProviderException 
     * @throws NoSuchAlgorithmException 
     */
    /*@DoAction
    public Response shareToGroup(Request req,HttpServletRequest request,HttpServletResponse response) throws Exception{

        Response resp = new Response();

        //游戏id
        String gameId = req.getGameId();

        //用户id
        String ua = req.getUa();

        JSONObject jsonObject = JSONObject.parseObject(req.getData().toString());

        String encryptedData  = jsonObject.getString("encryptedData");
        String iv = jsonObject.getString("iv");
        String sessionKey = jsonObject.getString("sessionKey");

        //解密
        jsonObject = WXGameDecrypt.getDecryptMsg(encryptedData, iv, sessionKey);

        //获取群Id
        String groupId  = jsonObject.getString("openGId");
        //System.out.println("群ID="+groupId);
        if(groupId == null){
            resp.setData("false");
            resp.setMsg("获取群ID失败");
            return resp;
        }

        String str = cfs.getStringFromCache(CacheKey.getWXGameShareKey(gameId, groupId));
        //System.out.println("str="+str);

        if(str == null){
            int time = (int) GetTime.getTime();
            //System.out.println("time="+time);
            cfs.setStringToCache(CacheKey.getWXGameShareKey(gameId, groupId),time, ua);
            resp.setData("success");
            resp.setMsg("分享成功");
        }else{
            resp.setData("fail");
            resp.setMsg("已经分享过");
        }

        return resp;

    }



    /**
      * 微信小游戏解密工具类
      * 
      * @author Administrator
      * 
      */
    /*public class WXGameDecrypt {
        public static JSONObject getDecryptMsg(String encryptedData, String iv,
                                               String sessionKey) {
            // 被加密的数据
            byte[] dataByte = Base64.decode(encryptedData);
            // 加密秘钥
            byte[] keyByte = Base64.decode(sessionKey);
            // 偏移量
            byte[] ivByte = Base64.decode(iv);
            try {
                // 如果密钥不足16位，那么就补足. 这个if 中的内容很重要
                int base = 16;
                if (keyByte.length % base != 0) {
                    int groups = keyByte.length / base
                            + (keyByte.length % base != 0 ? 1 : 0);
                    byte[] temp = new byte[groups * base];
                    Arrays.fill(temp, (byte) 0);
                    System.arraycopy(keyByte, 0, temp, 0, keyByte.length);
                    keyByte = temp;
                }
                // 初始化
                Security.addProvider(new BouncyCastleProvider());
                Cipher cipher = Cipher.getInstance("AES/CBC/PKCS7Padding", "BC");
                SecretKeySpec spec = new SecretKeySpec(keyByte, "AES");
                AlgorithmParameters parameters = AlgorithmParameters
                        .getInstance("AES");
                parameters.init(new IvParameterSpec(ivByte));
                cipher.init(Cipher.DECRYPT_MODE, spec, parameters);// 初始化
                byte[] resultByte = cipher.doFinal(dataByte);
                if (null != resultByte && resultByte.length > 0) {
                    String result = new String(resultByte, "UTF-8");
                    return JSONObject.parseObject(result);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }
    }
    ---------------------
    作者：huang_gao3
    来源：CSDN
    原文：https://blog.csdn.net/huang_gao3/article/details/80165320
    版权声明：本文为博主原创文章，转载请附上博文链接！
     */
}
