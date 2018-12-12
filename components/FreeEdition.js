import React from 'react';
import { Icon, Button, Popover } from 'antd';
import stylesheet from 'styles/components/freeEdition.scss';
import { getFreeLimit } from '../core/service/user.service';
import Storage from '../core/utils/storage'; 
import { getTeamInfoWithMoney } from '../core/utils/util';

/*
 * （必填）closedCallBack()         // 关闭回调
 * （选填）canClosed:true,         // 是否可关闭 默认可关闭
 */

export default class freeEdition extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
			loading: false
        }
    }
    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }
    freeEditionUse() {
		this.setState({loading:true})
		getFreeLimit((data) => {
            if(data.err){
                return false;
            }	
            Storage.set('user',data);
			location.reload();        
        })
    }
    render() { 
        return(
            <div className="version"> 
                <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
                <div className="edition">
					<div className="version2">
							<h3>版本对比</h3>
							<Icon type="close" className='closeIcon' onClick={()=>{this.props.closedCallBack()}} />
							<table>
								<tbody>

									<tr>
										<td>功能</td>
										<td style={{color:'#199fd8'}}>免费版</td>
										<td>基础版</td>
										<td>专业版</td>
									</tr>
									<tr>
										<td>自动同步钉钉组织架构</td>
									
										<td><Icon type="check"/></td>
										<td><Icon type="check"/></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>钉钉实时工作通知</td>
										<td><Icon type="check"/></td>
										<td><Icon type="check"/></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>4W1H多维度定义任务</td>
										<td><Icon type="check"/></td>
										<td><Icon type="check"/></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>无限分解子任务</td>
										<td><Icon type="check"/></td>
										<td><Icon type="check"/></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>钉盘存储分类任务附件</td>
										<td><Icon type="check"/></td>
										<td><Icon type="check"/></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>关联前后工序任务</td>
										<td></td>
										<td></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>任务导入导出</td>
										<td></td>
										<td></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>批量修改任务</td> 
										<td></td>
										<td></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>跨项目复制移动任务</td>
										<td></td>
										<td></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>WBS条理化汇总文件</td>
										<td></td>
										<td></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>甘特图管理时间序列</td>
										<td></td>
										<td></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>多维度项目数据统计</td>
										<td></td>
										<td></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>精准工作动态</td>
										<td><Icon type="check"/></td>
										<td><Icon type="check"/></td>
										<td><Icon type="check"/></td>
									</tr>
									<tr>
										<td>多维度筛选跟进任务</td>
										<td></td>
										<td></td>
										<td><Icon type="check"/></td>
									</tr>
								</tbody>
							</table>
					</div>
					<div className="version2 version3">
								
									<table>
										<tbody>

										<tr>
											<td>资源</td>
											<td style={{color:'#199fd8'}}>免费版</td>
											<td>基础版</td>
											<td>专业版</td>
										</tr>
										<tr>
											<td>团队总人数</td>
											<td>不限</td>
											<td>不限</td>
											<td>不限</td>
										</tr>
										<tr>
											<td>应用授权人数</td>
											<td>不限</td>
											<td>不限</td>
											<td>不限</td>
										</tr>
										<tr>
											<td>项目总数量</td>
											<td>不限</td>
											<td>不限</td>
											<td>不限</td>
										</tr>
										<tr>
											<td>任务总数量</td>
                                            <td>200条/月</td>
											<td>不限</td>
											<td>不限</td>
										</tr>
										</tbody>
										
									</table>
							</div>
				</div>		
				<div className='enterFree'>
				<Button 
					className='beginUse'  type="primary"
					onClick={() => {this.freeEditionUse()}}
					loading={this.state.loading}
				>开始使用</Button>
				<Popover 
				 content={
						<img src="../static/react-static/pcvip/imgs/ewmMaYi.png" style={{width:'200px',height:'200px'}}/>
				 } placement="top" >
                    <Button>升级版本</Button>
                </Popover>
				</div>
			</div>
        )
    }
}