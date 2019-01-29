import api from '../api'
//获取订单列表
export function getFeeOrderList(searchOptions) {
  return {
    type: 'GetFeeOrderList',
    payload: {
      promise: api.put('/GetFeeOrderList',searchOptions)
    }
  }
}
//检测是否重复录入订单
export function testNewOrderExist(formOrderInfo) {
  return {
    type: 'TestNewOrderExist',
    payload: {
      promise: api.put('/TestNewOrderExist',formOrderInfo)
    }
  }
}
//保存订单信息
export function saveFeeOrderInfo(formOrderInfo) {
  return {
    type: 'SaveFeeOrderInfo',
    payload: {
      promise: api.put('/SaveFeeOrderInfo',formOrderInfo)
    }
  }
}
//取消订单信息
export function cancelOrderInfo(formOrderInfo) {
  return {
    type: 'CancelOrderInfo',
    payload: {
      promise: api.put('/CancelOrderInfo',formOrderInfo)
    }
  }
}
//查询订单对应的退单信息
export function getFeeRefundOrderInfo(formOrderInfo) {
  return {
    type: 'GetFeeRefundOrderInfo',
    payload: {
      promise: api.put('/GetFeeRefundOrderInfo',formOrderInfo)
    }
  }
}
//保存退单信息
export function saveFeeRefundOrderInfo(formRefundInfo) {
  return {
    type: 'SaveFeeRefundOrderInfo',
    payload: {
      promise: api.put('/SaveFeeRefundOrderInfo',formRefundInfo)
    }
  }
}
//获取订单发票列表
export function getFeeInvoiceList(searchOptions) {
  return {
    type: 'GetFeeInvoiceList',
    payload: {
      promise: api.put('/GetFeeInvoiceList',searchOptions)
    }
  }
}
//保存信息
export function saveFeeInvoiceInfo(formOrderInfo) {
  return {
    type: 'SaveFeeInvoiceInfo',
    payload: {
      promise: api.put('/SaveFeeInvoiceInfo',formOrderInfo)
    }
  }
}
//取消
export function cancelInvoiceInfo(formOrderInfo) {
  return {
    type: 'CancelInvoiceInfo',
    payload: {
      promise: api.put('/CancelInvoiceInfo',formOrderInfo)
    }
  }
}