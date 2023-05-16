import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Image } from 'react-native';
// import { Layout, Text } from 'react-native-rapi-ui';
import * as tf from '@tensorflow/tfjs';
import {fetch, decodeJpeg, bundleResourceIO} from '@tensorflow/tfjs-react-native'
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
	const [model, setModel] = useState(null);
	const [isTfReady, setIsTfReady] = useState(false);
  	const [result, setResult] = useState('');
	useEffect(() => {
		console.log('first')
	}, [])
	
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
			load(result.assets[0].uri)
		  setImage(result.assets[0].uri);
		}
	  };
	

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
