import React from 'react';
import { Modal} from 'antd';
/*
 （选填） closeCallBack()    // 关闭回调
 */

export default class MoneyEnd extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible:true,
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
        }
    }
    render() { 
        const { visible} = this.state;
        return(
                <Modal
                    visible={visible}
                    width={1000}
                    closable={true}
                    onCancel={()=>{this.closeModal()}}
                    footer={null}
                >    
                    <img src='../static/react-static/pcvip/imgs/shouquan.gif' style={{width:960}}/> 
                </Modal>
           
        )
    }
}