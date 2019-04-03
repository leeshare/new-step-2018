package com.step.train.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

/**
 * Created by Administrator on 2/28/2019.
 */
@Configuration
@ConfigurationProperties(prefix = "fastdfs")
@PropertySource("classpath:/config.properties")
public class Config {

    private String file_server_addr;

    private String max_storage_connection;

    private String connect_timeout_in_seconds;

    private String network_timeout_in_seconds;

    private String charset;

    private String http_anti_steal_token;

    private String http_secret_key;

    private String http_tracker_http_port;

    private String tracker_servers;

    private String aes_pwd;

    private String app_id;
    private String mch_id;
    private String key;
    private String secret;

    public String getFile_server_addr() {
        return file_server_addr;
    }

    public void setFile_server_addr(String file_server_addr) {
        this.file_server_addr = file_server_addr;
    }

    public String getMax_storage_connection() {
        return max_storage_connection;
    }

    public void setMax_storage_connection(String max_storage_connection) {
        this.max_storage_connection = max_storage_connection;
    }

    public String getConnect_timeout_in_seconds() {
        return connect_timeout_in_seconds;
    }

    public void setConnect_timeout_in_seconds(String connect_timeout_in_seconds) {
        this.connect_timeout_in_seconds = connect_timeout_in_seconds;
    }

    public String getNetwork_timeout_in_seconds() {
        return network_timeout_in_seconds;
    }

    public void setNetwork_timeout_in_seconds(String network_timeout_in_seconds) {
        this.network_timeout_in_seconds = network_timeout_in_seconds;
    }

    public String getCharset() {
        return charset;
    }

    public void setCharset(String charset) {
        this.charset = charset;
    }

    public String getHttp_anti_steal_token() {
        return http_anti_steal_token;
    }

    public void setHttp_anti_steal_token(String http_anti_steal_token) {
        this.http_anti_steal_token = http_anti_steal_token;
    }

    public String getHttp_secret_key() {
        return http_secret_key;
    }

    public void setHttp_secret_key(String http_secret_key) {
        this.http_secret_key = http_secret_key;
    }

    public String getHttp_tracker_http_port() {
        return http_tracker_http_port;
    }

    public void setHttp_tracker_http_port(String http_tracker_http_port) {
        this.http_tracker_http_port = http_tracker_http_port;
    }

    public String getTracker_servers() {
        return tracker_servers;
    }

    public void setTracker_servers(String tracker_servers) {
        this.tracker_servers = tracker_servers;
    }

    public String getAes_pwd() {
        return aes_pwd;
    }

    public void setAes_pwd(String aes_pwd) {
        this.aes_pwd = aes_pwd;
    }

    public String getApp_id() {
        return app_id;
    }

    public void setApp_id(String app_id) {
        this.app_id = app_id;
    }

    public String getMch_id() {
        return mch_id;
    }

    public void setMch_id(String mch_id) {
        this.mch_id = mch_id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }
}
