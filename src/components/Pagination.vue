<template>
    <div class="pagination-pages">
        <el-pagination
        	background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="pageSizes"
            :page-size="pageSize"
            layout="total, prev, pager, next"
            :total="total">
        </el-pagination>
    </div>
</template>
<script>
export default {
    props:{
        currentPage:{
            type:Number,
            default:()=>{}
        },
        total:{
            type:Number,
            default:()=>{}
        },
        pageSize:{
            type:Number,
            default:()=>{}
        },
         pageSizes:{
            type:Array,
            default:()=>{}
        }
    },
    methods:{
        handleSizeChange(val){
            this.$emit('sizeChange',val)
        },
        handleCurrentChange(val){
            this.$emit('currentChange',val)
        }
    }
}
</script>
<style scoped>
.pagination-pages{
    margin-top: 9px;
    background: #F5F5F5;
}
.el-pagination{
    text-align: right
}

</style>


