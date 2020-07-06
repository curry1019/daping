<template>
    <div id="app" class="recoWrapper">
        <router-view></router-view>
    </div>
</template>

<script>
	// import widgets from 'cesium/Widgets/widgets.css'
	export default {
		name: 'App',
		data() {
			return {}
		},
		methods: {},
		mounted() {},
	};
</script>

<style lang="scss">
        html,
        body,
        #mapContainer {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
	@import './assets/css/base.scss';
    .recoWrapper {
        width: 100vw;
        height:100vh;
        background: url('./assets/imgs/bg.png') no-repeat;
        background-size: 100% 100%;
        position: relative;
        overflow: hidden;
    }
	
	/*el-table 相关*/
	.el-table__header tr {
		padding: 0;
		height: 54px;
		background: rgba(25,177,201,.7);
		color: #FFFFFF;
		th {
			padding: 0;
			border: none !important;
			background: rgba(25,177,201,.7);
		}
	}
	.el-table .success-row {
		background: rgba(25,177,201,.4);
	}
	
	.el-table .warning-row {
		background: rgba(0, 0, 0, 0);
	}
	.el-table tbody tr:hover>td { 
	    background-color: transparent !important;
	}
	.el-table__row>td {
		padding: 0;
		border: none;
	}
	
	.el-table::before {
		height: 0px;
	}
	
	/*el分页 相关*/
	.el-pagination__total {
		height: 34px !important;
		line-height: 34px !important;
		font-size: 14px !important;
		color: #676767;
	}
	.pagination-pages .el-pagination button {
		width: 20px;
		min-width: 20px !important;
		height: 34px;
	}
	.pagination-pages .el-icon {
		font-size: 14px !important;
	}
	
	.pagination-pages .el-pager li {
		width: 34px !important;
		min-width: 34px !important;
		height: 34px;
		margin: 0 !important;
		padding: 0 !important;
		line-height: 34px;
		font-size:14px;
	}
	
    
</style>