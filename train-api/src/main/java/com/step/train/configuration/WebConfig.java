package com.step.train.configuration;

import com.step.train.filter.PassportInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

@Configuration
public class WebConfig extends WebMvcConfigurationSupport {

    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new PassportInterceptor())
                .addPathPatterns("/api/user/**")
                .excludePathPatterns("/api/login/**");
        super.addInterceptors(registry);
    }
}
