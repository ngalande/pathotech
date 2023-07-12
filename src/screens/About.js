import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Image, Platform } from 'react-native';
// import { Layout, Text } from 'react-native-rapi-ui';
import * as tf from '@tensorflow/tfjs';
import {cameraWithTensors, decodeJpeg, bundleResourceIO} from '@tensorflow/tfjs-react-native'
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
	useEffect(() => {
		console.log('first')
		tfLoaded().then(() => {
			console.log('[Mine] ',isTfReady)
		  })
	}, [isModelReady, isTfReady])

	const getPermissionAsync = async () => {
		if (Constants.platform.android) {
		  const { status } = await Permissions.askAsync(Permissions.CAMERA)
		  if (status !== 'granted') {
			alert('Sorry, we need camera roll permissions to make this work!')
		  }
		}
	  }
	  
	
	const tfLoaded = async () => {
		if(isTfReady && isModelReady){
			console.log('[LOG]: Already loaded')
		}else{
			await tf.ready()
			setIsTfReady(true)
			
			// const model = await mobilenet.load().then(res => {
			// 	return res
			// }).catch(e => {
			// 	console.log(e)
			// })

			const model = await tf.loadLayersModel(
				bundleResourceIO(modelJSON, [modelWeights1, modelWeights2, modelWeights3, modelWeights4])
			).catch(e => {
				console.log("[LOADING ERROR] info:",e)
			})

			// const model = await tf.loadLayersModel("https://kaggle.com/models/rishitdagli/plant-disease/frameworks/TfJs/variations/default/versions/1", { fromTFHub: true })
			
			setIsModelReady(true)
			setModel(model)
			model.
			// console.log('hello')
			getPermissionAsync()
		}
		
	}

	const imageToTensor = (rawImageData) => {
		const TO_UINT8ARRAY = true
		const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
		// Drop the alpha channel info for mobilenet
		const buffer = new Uint8Array(width * height * 3)
		let offset = 0 // offset into original data
		for (let i = 0; i < buffer.length; i += 3) {
		  buffer[i] = data[offset]
		  buffer[i + 1] = data[offset + 1]
		  buffer[i + 2] = data[offset + 2]
	
		  offset += 4
		}
		const img = tf.expandDims(buffer, axis =0)
		return tf.tensor3d(buffer, [height, width, 3], 'float32')
	  }
	const state = {
		isTfReady: false,
		isModelReady: false,
		predictions: null,
		image: null
	  }
	
	const classifyImage = async (image) => {
		try {
		//   const imageAssetPath = Image.resolveAssetSource(image)
		  const imgB64 = await FileSystem.readAsStringAsync(image, {
			encoding: FileSystem.EncodingType.Base64,
		  })
		  const offset = tf
		  const TO_UINT8ARRAY = true
		  
		  const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer
		  const imgRaw = new Uint8Array(imgBuffer)
		//   const img32 = document.getElementById(image)
		//   const { width, height, data } = jpeg.decode(imgRaw, TO_UINT8ARRAY)
		const imgData = imageToTensor(imgRaw)
		// const tensorImg = tf.browser.fromPixels(imgData).resizeNearestNeighbor([244,244]).toFloat().sub(offset).div(offset).expandDims()
		  console.log('check')
		//   const imageTensor = decodeJpeg(imgRaw)
		//   const img = tf.expandDims(imageTensor, axis =0)
		  const predictions = await model.predict(imgData)
		//   setPredictionData({ predictions })
		  console.log(predictions)
		} catch (error) {
		  console.log(error)
		}
	  }
	  






	const load = async(img) =>{
		try{
			await tf.ready()
			if(isTfReady){
				const modelDat = await tf.loadLayersModel(
					bundleResourceIO(modelJSON, [modelWeights1, modelWeights2, modelWeights3, modelWeights4])
				).catch(e => {
					console.log("[LOADING ERROR] info:",e)
				})
				setIsTfReady(true)
				setModel(modelDat)
			}

			const weights = [modelWeights1, modelWeights2, modelWeights3, modelWeights4]
			const modelConfig = { modelJSON, weights };
			const modelDat = await tf.loadGraphModel(modelConfig, {fromTFHub: true} ).catch(e => {
				console.log("[LOADING ERROR] info:",e)
			})
			// start inference
			// const img = image
			// console.log(img)
			// const image = require('../../assets/forget.png')
			// const imageAssetPath = Image.resolveAssetSource(image)
			// const img64 = await FileSystem.readAsStringAsync(uri, {encoding:FileSystem.EncodingType.Base64})
			const img64 = await FileSystem.readAsStringAsync(img, {encoding:FileSystem.EncodingType.Base64})
			const imgBuffer =  tf.util.encodeString(img64, 'base64').buffer
			// const raw = new Uint8Array(imgBuffer)

			// const response = await fetch(imageAssetPath.uri, {}, {isBinary: true})
			// const imageDataArrayBuffer = await response.arrayBuffer()
			const imageData = new Uint8Array(imgBuffer)
			const imageTensor = decodeJpeg(imageData)
			console.log(imageTensor)
			const prediction = await modelDat.executeAsync(imageTensor)
			console.log(prediction)
			// const tets
			if (prediction && prediction.length > 0) {
				console.log(prediction)
				// setResult(
				//   `${prediction[0].className} (${prediction[0].probability.toFixed(3)})`
				// );
			  }
		}catch(e){
			console.log(e)
		}
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
			console.log(result.assets[0].uri);
			classifyImage(result.assets[0].uri)
			// load(result.assets[0].uri)
		  setImage(result.assets[0].uri);
		}
	  };
	 const textureDims = Platform.OS == 'ios' ? {height: 1920, width: 1080} : {height: 1200, width: 1600}
	  const handleCameraStream = (images) => {
		const loop = async() => {
			const nexImageTensor = images.next().value

		}
		loop()
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
				{isTfReady ? (
					<View>
						{isModelReady ? (
							<>
								<Text>Model is Ready</Text>
								<TensorCamera style={{}} 
									type={CameraType.back}
									cameraTextureHeight={textureDims.height}
									cameraTextureWidth={textureDims.width}
									resizeHeight={244}
									resizeWidth={244}
									resizeDepth={3}
									onReady={handleCameraStream}
									autorender={true}
									useCustomShadersToResize={false}

								/>
							</>
						):(
							<Text>Loading Model</Text>
						)}
						<Button
						text={"Open Camera"}
						onPress={() => {pickImage()}}
						style={{
							marginTop: 10,
						}}
						/> 
					</View>
				) : (
					<>
						<Text>Loading Model</Text>
					</>
				)}
				
			</View>
		</Layout>
	);
}
