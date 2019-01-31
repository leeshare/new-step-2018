package com.step.train.configuration;

import com.step.train.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import java.util.List;

@Configuration
public class WebConfig
        //extends WebMvcConfigurationSupport
    extends WebMvcConfigurerAdapter
{

    //@Autowired
    //UserService userService;

    /**
     * 将拦截器作为bean写入配置中
     * 此方法的作用是，防止 PassportInterceptor 中的 userService 为 null
     * @return
     */
    /*@Bean
    public PassportInterceptor passportInterceptor(){
        return new PassportInterceptor();
    }*/

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(passportInterceptor())
                .addPathPatterns("/api/user/**")
                .addPathPatterns("/api/org/**")
                .addPathPatterns("/api/teacher/**")
                .addPathPatterns("/api/course/**")
                .excludePathPatterns("/api/login/**");
        super.addInterceptors(registry);
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(currentUserMethodArgumentResolver());
        super.addArgumentResolvers(argumentResolvers);
    }

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        converters.add(fastJsonHttpMessageConverterEx());
        super.configureMessageConverters(converters);
    }

    @Bean
    public FastJsonHttpMessageConverterEx fastJsonHttpMessageConverterEx() {
        return new FastJsonHttpMessageConverterEx();
    }

    @Bean
    public CurrentUserMethodArgumentResolver currentUserMethodArgumentResolver() {
        return new CurrentUserMethodArgumentResolver();
    }

    @Bean
    public PassportInterceptor passportInterceptor() {
        return new PassportInterceptor();
    }
}
