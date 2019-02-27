package com.step.train;

import com.step.train.util.fastdfs.FastDFSClient;

/**
 * Created by lxl on 19/2/28.
 */
public class Test {

    public static void main(String [] args){

        FastDFSClient fastDFSClient = new FastDFSClient();
        String file = "group1/M00/00/00/rBBeplx2uECARWCjAAefZ8UNCOE831.png";
        String key = "WithFastDFSToken";
        String url = fastDFSClient.getToken(file, key);
        System.out.println(url);

        //  token=e579a2699ce726a36ab048e3e7eafed6&ts=1551292561
        // http://47.110.255.125:9000/group1/M00/00/00/rBBeplx2uECARWCjAAefZ8UNCOE831.png?token=e579a2699ce726a36ab048e3e7eafed6&ts=1551292561

        //如果要 停用 fastDFS 的 token 验证,则 修改
        // /etc/fdfs/http.conf 中的 ttp.anti_steal.check_token=false
        // 然后重启nginx即可 /usr/local/nginx/sbin/nginx -s reload

    }
}
