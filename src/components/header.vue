<template>
    <div class="header">
        <h3 class="gradient-text">{{title}}</h3>
    </div>
</template>
<script>
    export default {
        data() {
            return {

            };
        },
        props: {
            title: {
                type:String,
                default:'人员和车辆监控平台',
                require: true
            },
            // isShow: {
            //     type:Boolean,
            //     default:true
            // }
        },
        methods: {
            // back() {
            //     this.$router.go(-1)
            // },
            // gotoCarPage(path){
            //     this.$router.push({path:path})
            // }
        },
        mounted() {
            
        }
    }
</script>
<style lang="scss" scoped>
    .header {
        width: 1920px;
        height: 88px;
        background-image: url('../assets/imgs/header_bg@2x.png');
        background-size: 100%;
        position: absolute;
        z-index: 999;
        top: 0;
        left: 0;
    }
    .gradient-text{
        height:88px;
        line-height: 88px;
        text-align: center;
        font-size:26px;
        letter-spacing: 8px;
        font-weight:600;
        color:rgba(0,255,245,1);
    }
</style>