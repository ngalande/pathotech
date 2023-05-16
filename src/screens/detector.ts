import * as tf from '@tensorflow/tfjs'
import {bundleResourceIO, decodeJpeg} from '@tensorflow/tfjs-react-native'
import * as FileSystem from 'expo-file-system';

const modelJSON = require('../modeljs/model.json')
const modelWeights1 = require('../modeljs/group1-shard1of4.bin')
const modelWeights2 = require('../modeljs/group1-shard2of4.bin')
const modelWeights3 = require('../modeljs/group1-shard3of4.bin')
const modelWeights4 = require('../modeljs/group1-shard4of4.bin')

const loadModel = async() => {
		
    const model = await tf.loadLayersModel(
        bundleResourceIO(modelJSON, [modelWeights1, modelWeights2, modelWeights3, modelWeights4])
    ).catch(e => {
        console.log("[LOADING ERROR] info:",e)
    })
    return model

}

const transformImageToTensor = async (uri)=>{
    //.ts: const transformImageToTensor = async (uri:string):Promise<tf.Tensor>=>{
    //read the image as base64
      const img64 = await FileSystem.readAsStringAsync(uri, {encoding:FileSystem.EncodingType.Base64})
      const imgBuffer =  tf.util.encodeString(img64, 'base64').buffer
      const raw = new Uint8Array(imgBuffer)
      let imgTensor = decodeJpeg(raw)
      const scalar = tf.scalar(255)

    //resize the image
      imgTensor = tf.image.resizeNearestNeighbor(imgTensor, [244, 244])
    //normalize; if a normalization layer is in the model, this step can be skipped
      const tensorScaled = imgTensor.div(scalar.asScalar())
    //final shape of the rensor
      const img = tf.reshape(tensorScaled, [1,300,300,3])
      return img
  }

  const makePredictions = async ( batch, model, imagesTensor )=>{
    //.ts: const makePredictions = async (batch:number, model:tf.LayersModel,imagesTensor:tf.Tensor<tf.Rank>):Promise<tf.Tensor<tf.Rank>[]>=>{
    //cast output prediction to tensor
    const predictionsdata= model.predict(imagesTensor)
    //.ts: const predictionsdata:tf.Tensor = model.predict(imagesTensor) as tf.Tensor
    let pred = predictionsdata.split(batch) //split by batch size
    //return predictions 
    return pred
}


export const getPredictions = async (image)=>{
    await tf.ready()
    const model = await loadModel() as tf.LayersModel
    const tensor_image = await transformImageToTensor(image)
    const predictions = await makePredictions(1, model, tensor_image)
    return predictions    
}