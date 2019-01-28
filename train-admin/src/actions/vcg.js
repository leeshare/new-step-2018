import api from '../api'
//vcg
export function getVCGAPILibrary(searchOptions) {
  return {
    type: 'GetVCGAPILibrary',
    payload: {
      promise: api.put('/GetVCGAPILibrary',searchOptions)
    }
  }
}
export function getLocalLibrary(searchOptions) {
  return {
    type: 'GetLocalLibrary',
    payload: {
      promise: api.put('/GetLocalLibrary',searchOptions)
    }
  }
}
export function vcg_Detail(pictureId) {
  return {
    type: 'VCG_Detail',
    payload: {
      promise: api.put('/VCG_Detail',{pictureId})
    }
  }
}
export function vcg_Download(pictureId) {
  return {
    type: 'VCG_Download',
    payload: {
      promise: api.put('/VCG_Download',{pictureId})
    }
  }
}
export function vcg_SaveCutImageInfo(imageInfo) {
  return {
    type: 'VCG_SaveCutImageInfo',
    payload: {
      promise: api.put('/VCG_SaveCutImageInfo',imageInfo)
    }
  }
}