<template>
    <div class="recoWrapper">
		<Head :title="title"></Head>
        <ol class="navWrapper">
            <li :class="count == index?'itemNav active':'itemNav'" v-for="(item,index) in navList" :key="index" @click="getCount(index)">
                {{item}}
            </li>
        </ol>
        <div class="searchBox">
            <div class="inpandicon" v-if="showIpt">
                <img src="../assets/imgs/icon_search@2x.png" alt="">
                <input type="text" v-model="searchName" placeholder="搜索人员/车辆位置" placeholder-class="">
            </div>
            <div class="searchText" @click="showIpt = !showIpt">搜索</div>
        </div>
        <div class="springBox" v-if="isShow">
			<div class="boxContent">
				<div class="contentTop">
					<div class="topLeft">{{subTitle}}</div>
					<div class="topRight" @click="closeSpring">
						<img class="rightLogo" src="../assets/imgs/icon_back@2x.png" alt="..." />
						<span class="rightText">返回</span>
					</div>
				</div>
				<div class="contentList" v-if="type === 1">
					<el-table class="list-page" :data="tableData" style="width: 100%;font-size:12px;background: transparent;color: #FFFFFF;" :row-class-name="tableRowClassName">
						<el-table-column min-width="100" align="center" prop="deviceNum" label="目标ID">
						</el-table-column>
						<el-table-column min-width="100" align="center" prop="speed" label="速度">
						</el-table-column>
						<el-table-column min-width="160" align="center" label="经纬度">
							<template slot-scope="scope">
								<span>{{scope.row.locationX}}</span>
								<span>,</span>
								<span>{{scope.row.locationY}}</span>
							</template>
						</el-table-column>
						<el-table-column min-width="100" align="center" prop="type" label="类别">
						</el-table-column>
						<el-table-column min-width="100" align="center" prop="direction" label="方位">
						</el-table-column>
						<el-table-column min-width="100" align="center" prop="num" label="工号">
						</el-table-column>
						<el-table-column min-width="100" align="center" prop="name" label="姓名">
						</el-table-column>
						<el-table-column min-width="100" align="center" prop="createTime" label="允许区域">
						</el-table-column>
					</el-table>
				</div>
				<div class="contentList" v-if="type === 2">
					<el-table class="list-page" :data="tableData" style="width: 100%;font-size:12px;background: transparent;color: #FFFFFF;" :row-class-name="tableRowClassName">
						<el-table-column min-width="100" align="center" prop="deviceNum" label="目标ID">
						</el-table-column>
						<el-table-column min-width="100" align="center" prop="speed" label="速度">
						</el-table-column>
						<el-table-column min-width="160" align="center" label="经纬度">
							<template slot-scope="scope">
								<span>{{scope.row.locationX}}</span>
								<span>,</span>
								<span>{{scope.row.locationY}}</span>
							</template>
						</el-table-column>
						<el-table-column min-width="100" align="center" prop="type" label="类别">
						</el-table-column>
						<el-table-column min-width="120" align="center" prop="direction" label="方位">
						</el-table-column>
						<el-table-column min-width="120" align="center" prop="num" label="车编号">
						</el-table-column>
						<el-table-column min-width="120" align="center" prop="createTime" label="允许区域">
						</el-table-column>
					</el-table>
				</div>
				<el-col :span="24" class="toolbar">
					<pagination :current-page=page :page-size=pageSize :total=total @sizeChange="sizeChange" @currentChange="currentChange"></pagination>
				</el-col>
			</div>
		</div>
        <el-dialog center title="电子围栏信息" :visible.sync="addWlShow">
            <el-form :model="wlForm">
                <el-form-item label="活动名称" :label-width="150">
                <el-input v-model="wlForm.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="活动区域" :label-width="150">
                <el-select v-model="wlForm.region" placeholder="请选择活动区域">
                    <el-option label="区域一" value="shanghai"></el-option>
                    <el-option label="区域二" value="beijing"></el-option>
                </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addWlShow = false">取 消</el-button>
                <el-button type="primary" @click="addWlShow = false">确 定</el-button>
            </div>
        </el-dialog>
        <div id='mapContainer'></div>
        <div id='toolbar'></div>
    </div>
</template>
<script>
    var that,lon,lat,alt,model,tt,models,animModel;
    models = new Map();
    import Head from '../components/header.vue';
    import pagination from '../components/Pagination.vue';
    import API from "../axios/service/manAndCar/manAndCar"; 
    export default {
        data() {
            return {
                total: 0, //列表总条数
				page: 1, //当前页码
				pageSize: 10,
				type: 1,
                tableData: [],
                subTitle: '人员信息列表',
                isShow:false,
                showIpt:false,
                
                title: "人员和车辆监控平台",
                count:-1,
                navList:["人员信息","车辆信息","热力图","切换二维GIS","设置电子围栏","轨迹回放"],
                searchName:"",
                earth:null,
                modelUrl:'',
                // models:[],
                line:undefined,
                polygon:undefined,
                addWlShow:false,
                wlForm:{},

                path: "",
				socket: "",
                lockReconnect: false, // 判断websocket是否重复创建
                infoArr:[]
            };
        },
        methods: {
            // 通过createWebSocket创建连接
			createWebSocket() {
				if(typeof(WebSocket) === "undefined") {
					alert("您的浏览器不支持socket")
				} else {
                    // 实例化socket
                    this.socket = new WebSocket(this.path);
					this.initWebSocket()
				}
            },
            // 初始化WebSocket
			initWebSocket: function() {
				// 监听socket连接
				this.socket.onopen = this.open;
				// 监听socket错误信息
				this.socket.onerror = this.error;
				// 监听socket消息
				this.socket.onmessage = this.getMessage;
				// 监听socket关闭
				this.socket.onclose = this.close;
			},
			open: function() {
				console.log("socket连接成功")
				//心跳检测重置
				//this.heartCheck().start();
			},
			error: function() {
				console.log("连接错误")
				this.reconnect()
            },
            getMessage: function(msg) {
                //获取人车信息
                let data = JSON.parse(msg.data);
                let type = data.type;                  // 类型
                let carInfo = JSON.parse(data.data);   // 信息
                let origiPos = {
                    // lon: carInfo.locationX, //经度
                    // lat: carInfo.locationY, //维度
                    // alt: carInfo.locationZ, //高度
                    // angle: carInfo.locationDirection, //方位角度
                    // time: new Date() //时间

                    lon: 116.3678, //经度
                    lat: 39.90580, //维度
                    alt: 0, //高度
                    angle: 90, //方位角度
                    time: new Date() //时间
                };
                // console.log(carInfo,'00909');

                if(this.infoArr.length > 0){
                    //是否已经存在人车模型，存在即更新移动位置
                    if(this.infoArr.includes(carInfo.deviceNum)){
                        console.log('我已经存在了')
                        let anaCollection = new animationModelCollection(this.earth);
                        anaCollection.startTime = new Date();
                        // let animModel;
                        // animModel = new animationModel(models.get(carInfo.deviceNum), "测试模型");
                        let testModel = anaCollection.add(animModel);
                        //修改模型样式
                        testModel.model.scale = 3.0;   //模型比例
                        testModel.model.color = CTMap.Color.fromCssColorString('green');

                        let timePos = new timePosition(origiPos);
                        animModel.addTimePosition(timePos);
                        anaCollection.start();
                    }
                }else{
                    let modelUrl = "";                 //模型
                    console.log('我没有')
                    this.infoArr.push(carInfo.deviceNum);
                    //渲染人车模型
                    if(carInfo.reCategory == 1){
                        //人
                        modelUrl = CTMap.buildModuleUrl('Assets/models/firetruck.glb');
                    }else{
                        //车
                        switch (carInfo.carType) {
                            case "矿车":
                                modelUrl = CTMap.buildModuleUrl('Assets/models/firetruck.glb');
                                break;
                            case "消防车":
                                modelUrl = CTMap.buildModuleUrl('Assets/models/firetruck.glb');
                                break;
                            default:
                                break;
                        }
                    }
                    this.addModel(modelUrl,carInfo)
                }
			},
            send: function() {
				this.socket.send("123456789")
			},
			close: function() {
				console.log("socket已经关闭")
				this.reconnect()
			},
			reconnect() {
				var that = this
				if(that.lockReconnect) {
			    	return;
			    };
			    that.lockReconnect = true;
			    //没连接上会一直重连，设置延迟避免请求过多
			    tt && clearTimeout(tt);
			    tt = setTimeout(function () {
			        that.createWebSocket();
			        that.lockReconnect = false;
			    }, 4000);
			},
            init() {
                //初始化地球
                this.earth = new CTMap.Viewer('mapContainer');
                var layers = this.earth.scene.imageryLayers;
                //加载地图
                var img_google = new CTMap.UrlTemplateImageryProvider({
                    subdomains: ["1", "2", "3"],
                    url: "http://mt{s}.google.cn/vt/lyrs=y&hl=zh-CN&x={x}&y={y}&z={z}"
                });
                
                layers.addImageryProvider(img_google);

                lon = 109.983778;
                lat = 41.801600;
                alt = 0;
                //添加右下角经纬度显示
                this.earth.navigation.mousePosition.show = true;
    
                this.earth.camera.flyTo({
                    destination: CTMap.Cartesian3.fromDegrees(lon, lat, 1900.0)
                });
            },
            getCount(val){
                this.count = val;
                switch (val) {
                    case 0:
                    	that.subTitle = '人员信息列表';
                        that.type = 1;
                        this.isShow = true;
	                	that.getList();
	                	break;
                    case 1:
                        that.subTitle = '车辆信息列表';
	                	that.type = 2;
	                	that.getList();
                        break;
                    case 4:
                        this.isShow = false;
                        this.drawWl();
                        break;
                
                    default:
                        break;
                }
            },
            tableRowClassName({
				row,
				rowIndex
			}) {
				if(rowIndex % 2 == 1) {
					return 'success-row';
				} else {
					return 'warning-row';
				}
			},
			//分页改变后进行查询
			currentChange(val) {
				this.page = val;
				this.getList();
			},
			sizeChange(val) {
				this.pageSize = val;
				this.getList();
			},
            closeSpring(){
                this.isShow = false;
                this.page = 1;
            },
            
            getList() {
            	let params = {
                		pageNum: that.page,
                		pageSize: that.pageSize,
                		type: that.type
                	}
	            API.getList(params)
	                .then(
	                    function(result) {
	                        if (result.code == 0) {
	                        	that.tableData = result.data.records;
	                        	that.total = result.data.total;
	                        	that.isShow = true;
	                             console.log(result.data);
	                        } else {
	                            that.$message.error({
	                                showClose: true,
	                                message: result.msg,
	                                duration: 2000
	                            });
	                        }
	                    },
	                    function(err) {
	                        that.loading = false;
	                        that.$message.error({
	                            showClose: true,
	                            customClass:'isLoginSuc',
	                            message: err.toString(),
	                            duration: 2000
	                        });
	                    }
	                )
	                .catch(function(error) {
	                    that.loading = false;
	                    console.log(error);
	                    that.$message.error({
	                        showClose: true,
	                        message: "请求出现异常",
	                        customClass:'isLoginSuc',
	                        duration: 2000
	                    });
	                });
        	},
			//模型加载方法
            addModel(url,carInfo) {
                

                animModel = new animationModel(url, carInfo.carType);

                let testModel = anaCollection.add(animModel);
                //修改模型样式
                testModel.model.scale = 3.0;   //模型比例
                testModel.model.color = CTMap.Color.fromCssColorString('green');

                let timePos = new timePosition(origiPos);
                animModel.addTimePosition(timePos);
                anaCollection.start();


                
                // var heading = CTMap.Math.toRadians(Math.random() * 360);
                // var pitch = 0;
                // var roll = 0;
                // var hpr = new CTMap.HeadingPitchRoll(heading, pitch, roll);
                // let lon1 = carInfo.locationX;
                // let lat1 = carInfo.locationY;
                // let hgt1 = carInfo.locationZ;
                // let position = CTMap.Cartesian3.fromDegrees(lon1, lat1, hgt1);
                // var orientation = CTMap.Transforms.headingPitchRollQuaternion(position, hpr);
                // model = this.earth.entities.add({
                //     name: carInfo.carType,
                //     position: position,
                //     //模型
                //     model: {
                //         uri: url,
                //         minimumPixelSize: 50,
                //         maximumScale: 2000
                //     },
                //     //文字
                //     label: {
                //         text: carInfo.carType,
                //         style: CTMap.LabelStyle.FILL_AND_OUTLINE,
                //         font: "16px 微软雅黑",
                //         fillColor: CTMap.Color.YELLOW.withAlpha(0.8),
                //         outlineColor: CTMap.Color.GREEN.withAlpha(0.8),
                //         outlineWidth: 2.0,
                //         pixelOffset: new CTMap.Cartesian2(0, -20),
                //         showBackground: false,
                //         backgroundColor: CTMap.Color.BLACK.withAlpha(0.9),
                //         backgroundPadding: new CTMap.Cartesian2(2, 2),
                //         disableDepthTestDistance: Number.POSITIVE_INFINITY
                //     }
                // });
                models.set(carInfo.deviceNum, animModel);
            },
            //绘制线
            addPolyline(points) {
                this.line = this.earth.entities.add({
                    polyline: {
                        positions: CTMap.Cartesian3.fromDegreesArrayHeights(points),
                        width: 40.0,
                        material: CTMap.Color.RED.withAlpha(0.9)
                    }
                });
            },
            //绘制多边形
            addPolygon(points) {           
                this.polygon = this.earth.entities.add({
                    position:CTMap.Cartesian3.fromDegrees(points[0], points[1], points[2]),
                    polygon: {
                        hierarchy: CTMap.Cartesian3.fromDegreesArrayHeights(points),
                        width: 4.0,
                        material: CTMap.Color.fromCssColorString('green').withAlpha(0.8)//多边形颜色,
                            //此处 也可以用十六进制颜色值 CTMap.Color.fromCssColorString('#67ADDF');
                    },
                    //文字
                    label: {
                        text: "消防车",
                        style: CTMap.LabelStyle.FILL_AND_OUTLINE,
                        font: "16px 微软雅黑",
                        fillColor: CTMap.Color.YELLOW.withAlpha(0.8),
                        outlineColor: CTMap.Color.GREEN.withAlpha(0.8),
                        outlineWidth: 2.0,
                        pixelOffset: new CTMap.Cartesian2(20, -20),
                        showBackground: false,
                        backgroundColor: CTMap.Color.BLACK.withAlpha(0.9),
                        backgroundPadding: new CTMap.Cartesian2(2, 2),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY
                    }
                });
            },
            //绘制电子围栏方法
            drawWl() {
                this.earth.trackPolygon((pts) => {
                    setTimeout(()=>{
                        that.addWlShow = true;
                    },100)
                    
                    // this.addPolygon(pts);
                });
            }
            
        },
        mounted() {
            this.init();
        },
        components: {
            Head,
            pagination
        },
        created() {
            that = this;
            var host = window.location.host
			this.path = "ws://192.168.199.183:9019/nettyWebsocket";
            // this.path = "ws://" + host + "/nettyWebsocket";
            // 初始化WebSocket
			this.createWebSocket();
		}
    }
</script>
<style scoped lang="scss">
    input::-webkit-input-placeholder{
        color:#DBD9D9;
    }
    input:-moz-placeholder{
        color:#DBD9D9;
    }
    input::-moz-placeholder{
        color:#DBD9D9;
    }
    input:-ms-input-placeholder{
        color:#DBD9D9;
    }
    .navWrapper{
        width:114px;
        position: absolute;
		top: 120px;
		left: 32px;
        z-index:999;
        .itemNav{
            width:100%;
            height:40px;
            background: url("../assets/imgs/btn_bg_hide@2x.png") no-repeat;
            background-size: 100% 100%;
            text-align: center;
            line-height: 40px;
            font-size:14px;
            font-family:PingFang SC;
            color:rgba(25,247,255,1);
        }
        .itemNav.active{
            background: url("../assets/imgs/btn_bg_show@2x.png") no-repeat;
            background-size: 100% 100%;
            color:#fff;
        }
    }
    .searchBox{
        position:absolute;
        right:32px;
        top:126px;
        width:256px;
        height:34px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        font-size:14px;
        font-family:PingFang SC;
        font-weight:400;
        z-index:999;
        .inpandicon{
            border-left:1px solid rgba(25,247,255,1);
            border-top:1px solid rgba(25,247,255,1);
            border-bottom:1px solid rgba(25,247,255,1);
            width:200px;
            height:34px;
            display: flex;
            align-items: center;
            img{
                width:16px;
                height:16px;
                margin:0 8px;
            }
            input{
                flex:1;
                border:none;
                height:100%;
                outline: none;
                background:rgba(0,0,0,0.1);
                color:#f0f0f0;
            }
        }
        .searchText{
            width:56px;
            height:34px;
            line-height: 34px;
            text-align: center;
            background:rgba(0,117,255,0.6);
            border:1px solid rgba(25,247,255,1);
            color:#fff;
        }
    }
    // .contBox {
    //     padding: 0 16px;
	// 	box-sizing: border-box;
	// 	width: 960px;
	// 	height: 400px;
    //     position: absolute;
    //     z-index: 999;
	// 	top: 60px;
	// 	left: 0;
        
    // }
    .springBox {
		display: flex;
		justify-content: center;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
        height: 100%;
        z-index: 999;
		background: rgba(0, 0, 0, .6);
		.boxContent {
			width: 1040px;
			margin-top: 216px;
			.contentTop {
				display: flex;
				padding: 0 10px;
				font-size: 14px;
				font-weight: 400;
				.topLeft {
					flex: 1;
					color: #D1CACA;
				}
				.topRight {
					width: 120px;
					text-align: right;
					.rightLogo {
						width: 24px;
						height: 16px;
						margin-right: 12px;
						vertical-align: middle;
					}
					.rightText {
						color: #FFFFFF;
						vertical-align: middle;
					}
				}
			}
			.contentList {
				box-sizing: border-box;
				width: 100%;
				height: 616px;
				margin-top: 30px;
				padding: 32px 26px;
				background: url('../assets/imgs/list_bg@2x.png')no-repeat;
				background-size: 100% 100%;
			}
			.toolbar {}
		}
	}
</style>