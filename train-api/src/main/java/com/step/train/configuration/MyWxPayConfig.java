package com.step.train.configuration;

import com.github.wxpay.sdk.WXPayConfig;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

/**
 * Created by Administrator on 4/3/2019.
 */
public class MyWxPayConfig implements WXPayConfig {
    /** 加载证书  这里证书需要到微信商户平台进行下载*/
    private byte [] certData;

    @Autowired
    private Config config;

    public MyWxPayConfig() throws  Exception{
        InputStream certStream = Thread.currentThread().getContextClassLoader().getResourceAsStream("cert/wxpay/apiclient_cert.p12");
        this.certData = IOUtils.toByteArray(certStream);
        certStream.close();
    }

    /** 设置我们自己的appid
     * 商户号
     * 秘钥
     * */

    @Override
    public String getAppID() {
        return config.getApp_id();
    }

    @Override
    public String getMchID() {
        return config.getMch_id();
    }

    @Override
    public String getKey() {
        return config.getKey();
    }

    @Override
    public InputStream getCertStream() {
        return new ByteArrayInputStream(this.certData);
    }

    @Override
    public int getHttpConnectTimeoutMs() {
        return 0;
    }

    @Override
    public int getHttpReadTimeoutMs() {
        return 0;
    }
}
