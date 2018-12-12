import React from 'react'
import {Icon ,Input,Button,Spin} from 'antd';
import Router from 'next/router'
import stylesheet from 'styles/components/tagSelect.scss'
import { getTagList,getProjectTypeList } from '../core/service/tag.service';
import { getTagColorByColorCode,getTagTitColorByColorCode} from '../core/utils/util';
import NullView from '../components/nullView';

/*********
 *（必填）title:''            //标题
   (必填) type:''             //type为'1',是标签;type为'2',是项目分类
 *（必填）closedCallBack();     //关闭回调
 *（选填）selectedTags:([{id:'',labelname:'',color:'',......},])   //选中的标签，数组格式
 *（选填）selectedCallBack([{id:'',labelname:'',color:'',.....}]);     //选中回调
 * ********/
export default class TagSelect extends React.Component {	
	constructor(props) {
		super(props)
		this.state = {
            tagList:[],
            tagLoading:false,
            selectedTagList:[],
		}	
	}
	componentWillMount(){
        this.getList();
        const {selectedTagList}=this.state;
        if(this.props.selectedTags){
            this.props.selectedTags.map((item,i)=>{
                selectedTagList.push(item);
            })
            this.setState({selectedTagList:selectedTagList});
        }
	}
	componentWillReceiveProps(nextProps){
        const {selectedTagList}=this.state;
        if(nextProps.selectedTags){
            nextProps.selectedTags.map((item,i)=>{
                selectedTagList.push(item);
            });
            this.setState({selectedTagList:selectedTagList});
        }
	}	
	componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }
    getList(){
        if(this.props.type === '1'){
            this.getTagsList();
        }else if(this.props.type === '2'){
            this.getProjectTypesList();
        }
    }
     //获取标签列表
     getTagsList(){
        if (this.state.tagList.length === 0) {
            this.setState({tagLoading:true});
            getTagList((data) => {
                if(data.err){
                    return false;
                }
                this.setState({ tagList: data });
                this.setState({tagLoading:false});
            },this.props.isSmall);
        }
    }
    //获取项目分类列表
    getProjectTypesList(){
        if (this.state.tagList.length === 0) {
            this.setState({tagLoading:true});
            getProjectTypeList((data) => {
                if(data.err){
                    return false;
                }
                this.setState({ tagList: data.labels });
                this.setState({tagLoading:false});
            },this.props.isSmall);
        }
    }   
	
	selectedTag(id,labelname,color){
        const {selectedTagList} =this.state;
        if(selectedTagList.filter(val=>val.id === id).length === 0){
            selectedTagList.push({
                'id':id,
                'labelname':labelname,
                'color':color,
            });
        }else{
            selectedTagList.map((item,index)=>{
                if(item.id === id){
                    selectedTagList.splice(index,1);
                    return false;
                }
            });
        }
        this.setState({selectedTagList:selectedTagList});
    }
    
	render() {	
		const {tagList,tagLoading,selectedTagList} =this.state;
        
        return (
			<div className="tagSelect">
            <style dangerouslySetInnerHTML={{ __html: stylesheet }}/>
               <div className="tagContent">
                    <div className="titleBox">
                        <div className="title">{'选择'+this.props.title}</div>
                        <Icon type="close" className="close"
                        onClick={()=>{this.props.closedCallBack();}}/>
                    </div>
                    <div className="content">
                        <div className="leftContent">
                            {/* <div className="search">
                                <Icon type="search" className="searchIcon"/>
                                <Input className="input"
                                placeholder="标签名"/>
                            </div> */}
                            <div className="tagList">
                                <ul>
                                    {selectedTagList.length>0?selectedTagList.map((ite,i)=>{
                                        return(
                                            <li className={"textMore "+getTagColorByColorCode('1',ite.color)} key={ite.id}>
                                                <span>{ite.labelname}</span>
                                            </li>
                                        )
                                    }):''}
                                </ul>
                            </div>
                            <div className="butttonBox">
                                <Button type="primary" className="primary" onClick={()=>{this.props.selectedCallBack(selectedTagList);this.props.closedCallBack();}}>确定</Button>
                                <Button className="cancel" onClick={()=>{this.props.closedCallBack();}}>取消</Button>
                            </div>
                        </div>
                        <div className="rightContent">
                        <Spin spinning={tagLoading}/>
                        {tagList && tagList.length>0?tagList.map((item,i)=>{
                            return(
                                <div className="tagBox" key={item.id}>
                                    <h3>{item.labelname}</h3>
                                    <div className="tag">
                                        <ul>
                                            {item.parentList && item.parentList.length>0?item.parentList.map((tim,i)=>{
                                                return(
                                                    <li key={tim.id}
                                                    className={selectedTagList.filter(val=>val.id === tim.id).length>0?"textMore "+getTagColorByColorCode('1',item.color):"textMore "+getTagColorByColorCode('2',item.color)} 
                                                    onClick={()=>{this.selectedTag(tim.id, tim.labelname, item.color)}}>
                                                        <span>{tim.labelname}</span>
                                                    </li>
                                                )
                                            }):''}
                                        </ul>
                                    </div>
                                </div>
                            )
                        }):''}
                        </div>
                    </div>
               </div>
            </div>
		)
	}
}
