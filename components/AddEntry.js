import React,{Component} from 'react'
import {View , TouchableOpacity , Text, Platform, StyleSheet } from 'react-native'
import {getMetricMetaInfo, timeToString, getDailyReminderValue} from '../utils/helpers'
import { submitEntry, removeEntry } from '../utils/api'
import UdaciSlider from './UdaciSlider'
import UdaciStepper from './UdaciStepper'
import DateHeader from './DateHeader'
import {Ionicons} from '@expo/vector-icons'
import TextButton from './TextButton'
import {connect} from 'react-redux'
import {addEntry} from '../actions'
import {white, purple} from '../utils/colors'

function SubmitBtn({onPress}){
    return (
        <TouchableOpacity
         style ={Platform.OS === 'ios' ? styles.iosSubmitBtn : styles.androidSubmitBtn}
         onPress = {onPress}>
            <Text style = {styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
    )
}

class AddEntry extends Component{
    state = {
        run: 0,
        bike: 0,
        swim: 0,
        sleep: 0,
        eat: 0
    }

    increment = (metric) =>{
        const {max,step} = getMetricMetaInfo(metric)
        this.setState((state) => {
            const count = state[metric] + step

            return {
                ...state,
                [metric]: count > max ? max : count
            }
        })
    }

    decrement = (metric) => {
        const {step} = getMetricMetaInfo(metric)
        this.setState((state) => {
            const count = state[metric] - step

            return {
                ...state,
                [metric]: count < 0 ? 0 : count
            }
        })
    }

    slide = (metric,value) => {
        this.setState(() => ({
            [metric] : value
        }))
    }

    submit =() => {
        const key = timeToString()
        const entry = this.state

        this.props.dispatch(addEntry({
            [key]: entry
        }),console.log(this.props.alreadyLogged,this.props.state))

        

        this.setState({
            run: 0,
            bike: 0,
            swim: 0,
            sleep: 0,
            eat: 0
        })

        submitEntry({entry , key})

    }

    reset = () => {
        const key = timeToString()
        this.props.dispatch(addEntry({
            [key]: getDailyReminderValue()
        }))
        removeEntry(key)
    }

    render(){
        const metaInfo = getMetricMetaInfo()
        if(this.props.alreadyLogged){
            return (
                <View style = {styles.center}>
                    <Ionicons name = {Platform.OS === 'ios' ? 'ios-happy' : 'md-happy'} size = {100} />
                    <Text>You already logged your informatio for today</Text>
                    <TextButton onPress = {this.reset}>
                        reset
                    </TextButton>
                </View>
            )
        }
        return(
            <View style = {styles.container}>
                <DateHeader date = {(new Date().toLocaleDateString())} />
                {Object.keys(metaInfo).map((key) => {
                   const {getIcon, type, ...rest} = metaInfo[key]
                   const value = this.state[key]
                   return (
                       <View key = {key} style = {styles.row}>
                           {getIcon()}
                           {type === 'slider' ? 
                           <UdaciSlider  value = {value} 
                           onChange = {(value) => this.slide(key,value)} 
                           {...rest} /> 
                           : <UdaciStepper value = {value} 
                           onIncrement = {() => this.increment(key)}
                           onDecrement = {() => this.decrement(key)} 
                           {...rest} /> }
                       </View>
                     )
                })}
                <SubmitBtn onPress = {this.submit}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: white
    },
    iosSubmitBtn:{
       backgroundColor: purple,
       padding: 10,
       borderRadius: 7,
       height: 45,
       marginLeft: 40,
       marginRight: 40
    },
    androidSubmitBtn: {
        backgroundColor: purple,
        padding: 10,
        paddingLeft: 30,
        paddingRight: 30,
        height:45,
        borderRadius: 2,
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitBtnText: {
        color: white,
        fontSize: 22,
        textAlign: 'center'
    },
    row:{
        flexDirection: 'row',
        flex : 1,
        alignItems: 'center'
    },
    center:{
        flex : 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 30,
        marginLeft: 30
    }
})

function mapStateToProps(state){
    const key = timeToString()
    return {
        alreadyLogged: (state[key] && !state[key].today),
        state
    }
}

export default connect(mapStateToProps)(AddEntry)
