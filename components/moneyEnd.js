import React from 'react';
import { Icon, Button ,Modal,Popover} from 'antd';

import stylesheet from 'styles/components/moneyEnd.scss';
import { getTeamInfoWithMoney } from '../core/utils/util';
import { getFreeLimit } from '../core/service/user.service';
import FreeEdition from './FreeEdition';
import Storage from '../core/utils/storage'; 
import SpecificationDemo from '../components/SpecificationDemo';

/*
 * （必填）closeCallBack()         // 关闭回调
 * （选填）canClosed:true,         // 是否可关闭 默认可关闭
 */

export default class MoneyEnd extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            versionShow: false,
            free: false,
            visible:true,
            demo:false
        }
    }

    componentWillMount() { 
    }

    componentWillReceiveProps(nextProps) {
    }

    componentWillUnmount() {
        this.setState = (state,callback)=>{
            return;
        };  
    }
    freeEdition() {
        this.setState({free:true})
    }
    closeModal(){
        if(this.state.free||this.state.versionShow){
            this.setState({free:false,versionShow:false})
        }else{
            this.props.closeCallBack() 
        }
    }
    render() { 
        let { alertText,canClosed } = this.props;
        const { versionShow ,free,visible,demo} = this.state;
        if(canClosed === undefined){
            canClosed = true;
        }
        return(
            <Modal                    
                visible={visible}
                width={free?650:versionShow?850:520}
                closable={canClosed}
                onCancel={()=>{this.closeModal()}}
                footer={null}
                mask={true}
                className='moneyEnd'
                maskClosable={false}
                style={free?{}:versionShow?{}:{top:260,height:'400px'}}
            >
            <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
            {free?<FreeEdition closedCallBack={()=>{this.setState({free: false})}}></FreeEdition>:''}
            {versionShow?
                <div className="imgBox">
                    <p>基础版&专业版功能对比</p>
                   {!canClosed? <Icon type="close" onClick={()=>{this.setState({versionShow:false})}} />:''}
                    <div className="img">                            
                        <img src="../static/react-static/pcvip/imgs/versionTable1.png?t=2.1"/>
                        <img src="../static/react-static/pcvip/imgs/versionTable2.jpg?t=2.1"/>
                    </div>
                </div>
            :''}
            {demo? <SpecificationDemo closeCallBack={()=>{this.setState({demo:false})}}/>:''}
                <div className="writeBox" style={free||versionShow?{display:'none'}:{}}>
                    <p>
                        {alertText[0]}
                        <span onClick={()=>{this.setState({versionShow:true})}}>版本介绍</span>
                    </p>
                    <div className='myBorder'></div>
                        <div className="text" dangerouslySetInnerHTML={{__html:alertText[1]}}></div>
                    <div className='renew'>
                    {getTeamInfoWithMoney('版本名称')==='试用版'&&alertText[0]!=='使用人数超限'||alertText[2]==='MFB'?
                    <div className='bottomButton'>
                        <Popover
                            content={ <div>
                                {getTeamInfoWithMoney('是否钉钉订单')?
                                <div>
                                    <img src="../static/react-static/pcvip/imgs/ewmDing.png" style={{width:'200px',height:'230px',margin:'10px 0px 0 10px'}}/>
                                    <img src="../static/react-static/pcvip/imgs/ewmMaYi.png" style={{width:'200px',height:'230px',margin:'10px 10px 0 40px'}}/>
                                </div> :
                                <img src="../static/react-static/pcvip/imgs/ewmMaYi.png" style={{width:'200px',height:'230px',margin:'10px 10px 0px 10px'}}/>
                                }
                                     </div>
                                    }
                            placement='top'
                            trigger="click"
                        >
                            <Button type='primary' style={{marginRight:'20px',height:'30px'}}>升级专业版</Button>
                        </Popover>
                        <Popover
                            content={ <div>
                                {getTeamInfoWithMoney('是否钉钉订单')?
                                <div>
                                    <img src="../static/react-static/pcvip/imgs/ewmDing.png" style={{width:'200px',height:'230px',margin:'10px 0 0 10px'}}/>
                                    <img src="../static/react-static/pcvip/imgs/ewmMaYi.png" style={{width:'200px',height:'230px',margin:'10px 10px 0 40px'}}/>
                                </div> :
                                <img src="../static/react-static/pcvip/imgs/ewmMaYi.png" style={{width:'200px',height:'230px',margin:'10px 10px 0px 10px'}}/>
                                }
                                     </div>
                                    }
                            placement='top'
                            trigger="click"
                        >
                            <Button type='primary' style={{height:'30px'}}>升级基础版</Button>
                        </Popover>
                        {alertText[2]==='MFB'?<span onClick={()=>{this.props.closeCallBack() }} style={{color:'#BDBDBD',cursor: 'pointer',marginLeft:'20px'}}>继续使用免费版<Icon type="right" /></span>:
                        !getTeamInfoWithMoney('是否钉钉订单')&&getTeamInfoWithMoney('剩余天数')<0?<span onClick={()=>{this.freeEdition()}} style={{color:'#BDBDBD',cursor: 'pointer',marginLeft:'20px'}}>使用免费版<Icon type="right" /></span>:''
                        }
                    </div>:alertText[0]==='使用人数超限'?
                                            <div>
                                            <span className='shouquan' onClick={()=>{this.setState({demo:true})}}>如何管理授权？</span>
                                            <Popover
                                                content={ <div>
                                                    {getTeamInfoWithMoney('是否钉钉订单')?
                                                    <div>
                                                        <img src="../static/react-static/pcvip/imgs/ewmDing.png" style={{width:'200px',height:'230px',margin:'10px 0 0 10px'}}/>
                                                        <img src="../static/react-static/pcvip/imgs/ewmMaYi.png" style={{width:'200px',height:'230px',margin:'10px 10px 0 40px'}}/>
                                                    </div> :
                                                    <img src="../static/react-static/pcvip/imgs/ewmMaYi.png" style={{width:'200px',height:'230px',margin:'10px 10px 0px 10px'}}/>
                                                    }
                                                         </div>
                                                        }
                                                placement='top'
                                                trigger="click"
                                            >
                                            <Button type='primary' style={{height:'30px'}}>升级规格</Button>
                                            </Popover>
                                            </div>
                    :
                        <Popover
                            content={ <div>
                                {getTeamInfoWithMoney('是否钉钉订单')?
                                <div>
                                    <img src="../static/react-static/pcvip/imgs/ewmDing.png" style={{width:'200px',height:'230px',margin:'10px 0 0 10px'}}/>
                                    <img src="../static/react-static/pcvip/imgs/ewmMaYi.png" style={{width:'200px',height:'230px',margin:'10px 10px 0 40px'}}/>
                                </div> :
                                <img src="../static/react-static/pcvip/imgs/ewmMaYi.png" style={{width:'200px',height:'230px',margin:'10px 10px 0px 10px'}}/>
                                }
                                     </div>
                                    }
                            placement='top'
                            trigger="click"
                        >
                            {alertText[0]==='专业版功能'?<Button type='primary' style={{height:'30px'}}>升级专业版</Button>:
                            <Button type='primary' style={{height:'30px'}}>续费升级</Button>
                            }
                        </Popover>
                    }
                    </div>
                </div>
            </Modal>
        )
    }
}
