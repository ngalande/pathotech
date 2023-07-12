import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Image, Platform } from 'react-native';
// import { Layout, Text } from 'react-native-rapi-ui';
import * as tf from '@tensorflow/tfjs';
import {cameraWithTensors, decodeJpeg, bundleResourceIO, fetch} from '@tensorflow/tfjs-react-native'
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions'
import * as coco from '@tensorflow-models/coco-ssd'
import * as jpeg from 'jpeg-js'


import {
	Layout,
	Button,
	Text,
	TopNav,
	Section,
	SectionContent,
	useTheme,
  } from "react-native-rapi-ui";
import { Camera, CameraType } from 'expo-camera';
import { async } from '@firebase/util';

const TensorCamera = cameraWithTensors(Camera)

const modelJSON = require('../modeljs/model.json')
const modelWeights1 = require('../modeljs/group1-shard1of4.bin')
const modelWeights2 = require('../modeljs/group1-shard2of4.bin')
const modelWeights3 = require('../modeljs/group1-shard3of4.bin')
const modelWeights4 = require('../modeljs/group1-shard4of4.bin')
export default function ({ navigation }) {
	const [image, setImage] = useState(null);
	const [model, setModel] = useState(null);
	const [isTfReady, setIsTfReady] = useState(false);
  const [predictionData, setPredictionData] = useState('');
	const [isModelReady, setIsModelReady] = useState(false)
	// const [cocoModel, setCocoModel] = useState<coco.ObjectDetection>();

	const pickImage = async () => {
		console.log('result');
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
		  mediaTypes: ImagePicker.MediaTypeOptions.Images,
		  allowsEditing: true,
		  aspect: [4, 3],
		  quality: 1,
		});
	
		await tfLoaded()
		if (!result.canceled) {
			console.log(result.assets[0].uri);
			converImg(result.assets[0].uri)
			// classifyImage(result.assets[0].uri)
			// load(result.assets[0].uri)
		  setImage(result.assets[0].uri);
		}
	  };


  const tfLoaded = async () => {
		if(isTfReady && isModelReady){
			console.log('[LOG]: Already loaded')
		}else{
			await tf.ready()
			setIsTfReady(true)
			const model = await tf.loadLayersModel(
				bundleResourceIO(modelJSON, [modelWeights1, modelWeights2, modelWeights3, modelWeights4])
			).catch(e => {
				console.log("[LOADING ERROR] info:",e)
			})
			// const model = await tf.loadLayersModel("https://kaggle.com/models/rishitdagli/plant-disease/frameworks/TfJs/variations/default/versions/1", { fromTFHub: true })
			setIsModelReady(true)
			setModel(model)
		}
		
	}
  const converImg = async(img) => {
	// await tf.ready
    const imgB64 = await FileSystem.readAsStringAsync(img, {
		encoding: FileSystem.EncodingType.Base64,
	  })
	// const imgB64 =
	//   const offset = tf
	//   const TO_UINT8ARRAY = true
	  
	const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer
	const imgRaw = new Uint8Array(imgBuffer)
	const imgTensor = decodeJpeg(imgRaw)

	//process input data
	const inputHeight=244
	const inputWidth=244
	const resizeImage = tf.image.resizeNearestNeighbor(imgTensor, [inputHeight, inputWidth])
	const batchedImage = tf.expandDims(resizeImage, 0)
	const input2 = tf.div(batchedImage.toFloat(), tf.scalar(255))
	// const input = batchedImage.toFloat().div(tf.scalar(255));
	console.log(input2)
	// const pred = await model.predict(batchedImage)
	// console.log(pred)
	// const imgDataArrayBuffer = 
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
<<<<<<< HEAD
				<Text>This is the Profile tab</Text>

				<Button
						text={"Select Image"}
						onPress={() => {pickImage()}}
						style={{
							marginTop: 10,
						}}
						/> 
				
=======
				<Text>Profile tab</Text>
>>>>>>> 2b7b6fb6eb0a20f0bcfdaa09ac0b5910bf2a17b7
			</View>
		</Layout>
	);
}
