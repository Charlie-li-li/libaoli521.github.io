import React from 'react';
import { Modal,Button,  Row, Col, Slider} from 'antd';
import Storage from '../core/utils/storage';
import stylesheet from 'styles/components/versionUpdate.scss';


/*
 （选填） closeCallBack()    // 关闭回调
 */

export default class MoneyEnd extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }
    closeModal(){        

        if(this.props.closeCallBack){
            this.props.closeCallBack();
        }else{
            this.setState({visible:false});
        }
    }
    render() { 
        const {versionUpdateShow} = this.props;
        return(
                <Modal
                    visible={versionUpdateShow}
                    width={1000}
                    closable={true}
                    onCancel={()=>{this.closeModal()}}
                    footer={null}
                    mask={true}
                    className='upMask'
                >    
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <Row>
                    <Col span={4} className='upDateTime'>
                        <div className='upDateTimeNew'>2.1.4</div>                        
                        <span>2018.11.18</span>
                    </Col>
                    <Col span={20} className='upName'>
                        <div>任务的高级筛选与排序
                            <span className='demo' onClick={()=> {this.props.demoShowTest(true)}}>功能演示</span>
                        </div>
                        <p>重新设计任务列表的筛选功能，专业版支持同时按项目、标签、负责人、确认人、截止时间、任务绩效等多个条件筛选，新增支持不同的排序方式，筛选与排序都具有记忆功能，越用越顺手。任务截止时间精确到分钟，逾期之前及时提醒。同时优化了不同版本的引导弹窗以及更有条理的版本更新说明。</p>
                    </Col>
                </Row>
                <Row>
                    <Col span={4} className='upDateTime'>
                        <div>2.1.3</div>                        
                        <span>2018.10.16</span>
                    </Col>
                    <Col span={20} className='upName'>
                        <div>8项功能优化</div>
                        <p>新增：对于已离职或未授权人员的特殊显示、移动端的任务搜索功能；优化：动态列表筛选条件变更后列表自动回到顶部、人员统计图放大后的显示效果、已完成任务禁止删除成果文件、导入任务的交互与流程；修复：手动换行排版在两端显示不一样的问题、里程碑无法取消的问题、个别情况全部任务下显示不完整的问题。</p>
                    </Col>
                </Row>
                <Row>
                    <Col span={4} className='upDateTime'>
                        <div>2.1.2</div>                        
                        <span>2018.09.30</span>
                    </Col>
                    <Col span={20} className='upName moreText'>
                        <div>8项功能优化</div>
                        <p>新增：甘特图图例、分批次导出、绩效计算合法校验、点击每日通知可直接跳转工作台；
                            优化：动态列表中任务跳转逻辑、
                            已删除任务的提示页面、项目进展图绘制；修复：子任务列表催办缺失的问题
                            。</p>
                    </Col>
                </Row>
                <Row>
                    <Col span={4} className='upDateTime'>
                        <div>2.1.1</div>                        
                        <span>2018.09.21</span>
                    </Col>
                    <Col span={20} className='upName moreTextlast'>
                        <div>动态列表体验优化</div>
                        <p>
                        在列表中直接显示任务图片及讨论内容，查看更直观；调整UI布局，层次更清晰；筛选功能优化，使用更顺手。同时完成了多项功能优化，如修复了文件列表中过程文件的缺失问题、标签管理操作优化、任务文件及通知添加任务编号的显示等。
                        </p>
                    </Col>
                </Row>
                <Row className='lastText'>
                    <Col span={4} className='upDateTime'>
                        <div>2.1.0</div>                        
                        <span>2018.09.08</span>
                    </Col>
                    <Col span={20} className='upName'>
                        <div>专业版正式上线</div>
                        <p>
                        项目中新增甘特图、进展趋势图、任务分布图、人员待办统计图以及人员绩效统计图，新增人员待办与绩效的导出的功能。任务中新增“全部任务”视图，支持高级筛选及批量操作；新增任务的复制与移动，支持跨项目操作；新增任务完成后的撤回功能，支持在驳回、确认任务时上传文件；新增快捷隐藏已完成与任务包的功能。
                        </p>
                    </Col>
                </Row>       
            </Modal>
        )
    }
}