/**
 * 人员车辆监控平台api
 */
import * as API from '../../base/index'
export default {
	//获取人员车辆列表
	
	getList: params => {
		return API.$get(`api-meeting/people-car/pageQueryPcarInfo/${params.pageNum}/${params.pageSize}/${params.type}`)
	},	
}