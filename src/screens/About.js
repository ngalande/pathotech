import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
// import { Layout, Text } from 'react-native-rapi-ui';
import * as tf from '@tensorflow/tfjs';
import {bundleResourceIO, decodeJpeg} from '@tensorflow/tfjs-react-native'
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {
	Layout,
	Button,
	Text,
	TopNav,
	Section,
	SectionContent,
	useTheme,
  } from "react-native-rapi-ui";

const modelJSON = require('../modeljs/model.json')
const modelWeights1 = require('../modeljs/group1-shard1of4.bin')
const modelWeights2 = require('../modeljs/group1-shard2of4.bin')
const modelWeights3 = require('../modeljs/group1-shard3of4.bin')
const modelWeights4 = require('../modeljs/group1-shard4of4.bin')
export default function ({ navigation }) {
	const [image, setImage] = useState(null);
	useEffect(() => {
		console.log('first')
	}, [])
	const loadModel = async() => {
		
		const model = await tf.loadLayersModel(
			bundleResourceIO(modelJSON, [modelWeights1, modelWeights2, modelWeights3, modelWeights4])
		).catch(e => {
			console.log("[LOADING ERROR] info:",e)
		})
		return model

	}
	const inference = async(batch, model, imageTensor) => {
		const predictionsdata = model.predict(imageTensor)
		let pred = predictionsdata.split(batch)
		// console.log(predictionsdata)
		return pred
		// const model = await tf.loadLayersModel(modelURL)
		// model.summary()
	}
	const transformImageToTensor = async (uri)=>{
		console.log(uri)
		//.ts: const transformImageToTensor = async (uri:string):Promise<tf.Tensor>=>{
		//read the image as base64
		  const img64 = await FileSystem.readAsStringAsync(uri, {encoding:FileSystem.EncodingType.Base64})
		  const imgBuffer =  tf.util.encodeString(img64, 'base64').buffer
		  const raw = new Uint8Array(imgBuffer)
		  let imgTensor = decodeJpeg(raw)
		  const scalar = tf.scalar(255)
		  //resize the image
		  imgTensor = tf.image.resizeNearestNeighbor(imgTensor, [224, 224])
		  //normalize; if a normalization layer is in the model, this step can be skipped
		  const tensorScaled = imgTensor.div(scalar)
		  console.log(tensorScaled)
		//final shape of the rensor
		  const img = tf.reshape(tensorScaled, [1,300,300,3])
		  return img
	  } 
	const pickImage = async () => {
		console.log('result');
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
		  mediaTypes: ImagePicker.MediaTypeOptions.Images,
		  allowsEditing: true,
		  aspect: [4, 3],
		  quality: 1,
		});
	
		
		if (!result.canceled) {
			getPredictions(result.assets[0].uri)
			console.log(result.assets[0].uri);
		  setImage(result.assets[0].uri);
		}
	  };
	
	const getPredictions = async (image)=>{
		await tf.ready()
		const model = await loadModel()
		const tensor_image = await transformImageToTensor(image)
		const predictions = await inference(1, model, tensor_image)
		console.log(predictions)
		return predictions    
	}
	return (
		<Layout>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Text>This is the About tab</Text>
				{/* <TouchableOpacity onPress={() => {handleGallery()}}>
					Upload
				</TouchableOpacity> */}
				<Button
					text={"Open Camera"}
					onPress={() => {pickImage()}}
					style={{
						marginTop: 10,
					}}
					/> 
			</View>
		</Layout>
	);
}
