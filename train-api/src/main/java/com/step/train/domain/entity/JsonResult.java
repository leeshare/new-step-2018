package com.step.train.domain.entity;

public class JsonResult<T> {

    public static final int SUCCESS = 1;
    public static final int ERROR = 0;

    private static final long serialVersionUID = 1L;
    private T data;
    private int state;
    private String msg;


    /**
     * 没数据返回，默认0，成功
     */
    public JsonResult(){
        this.state = SUCCESS;
        this.msg = "操作成功！";
    }

    /**
     * 没数据返回，人为指定状态码和信息
     * @param msg
     */
    public JsonResult(String msg){
        this.state = ERROR;
        this.msg = msg;
    }

    /**
     * 有数据返回，状态码为0，消息人为指定
     * @param data
     */
    public JsonResult(T data){
        this.data = data;
        this.state = SUCCESS;
    }


    public JsonResult(Throwable e){
        state = ERROR;
        msg = e.getMessage();
    }
    public JsonResult(int state, Throwable e){
        this.state = state;
        this.msg = e.getMessage();
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public int getState() {
        return state;
    }

    public void setState(int state) {
        this.state = state;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    @Override
    public String toString(){
        return "JsonResult [state=" + state + ", msg=" + msg + ", data=" + data + "]";
    }

}
