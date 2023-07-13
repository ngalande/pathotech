import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Linking, StyleSheet, TouchableOpacity, Platform, Image, Alert, ActivityIndicator } from "react-native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { SimpleLineIcons, Feather, Ionicons  } from '@expo/vector-icons';
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
import { Camera, CameraType } from "expo-camera";
import { AuthContext } from "../provider/AuthProvider";
import axios from "axios";
import { Plants } from "../components/data/diseases";

export default function ({ navigation }) {
  const [type, setType] = useState(CameraType.back);
  const [isPreview, setIsPreview] = useState(false);
  const { isDarkmode, setTheme } = useTheme();
  const [camera, setCamera] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [condition, setCondition] = useState(null)
  const [disease, setDisease] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [image, setImage] = useState(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef();
  const [videoSource, setVideoSource] = useState(null);
  const {setUser, user} = useContext(AuthContext)

  useEffect(() => {
    // console.log(user)
    if(!isDarkmode){
      setTheme('dark')
    }
  }, [])
  useEffect(() => {
    // setIsPreview(false)
      const type = disease?.substring(disease?.indexOf('>')+1)
    console.log('[MINE]',Plants[prediction?.index])
  }, [isLoading])
  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={{flex: 1, justifyContent:'center', width: '50%', alignSelf:'center'}}>
        <Text style={{ textAlign: 'center', color:'#000' }}>We need your permission to show the camera</Text>
        <Button
              style={{ marginTop: 10, width: '50%' }}
              text="Grant Permission"
              status="info"
              onPress={requestPermission}
            />
        {/* <Button color="#000" onPress={requestPermission} title="grant permission" /> */}
      </View>
    );
    // console.log(permission.status)
  }
  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }
  const auth = getAuth();

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true, skipProcessing: true };
      const data = await cameraRef.current.takePictureAsync(options);
      const source = data.uri;
      if (source) {
        // await cameraRef.current.pausePreview();
        // setIsPreview(true);
        // const imageURL = result.assets[0].uri
        const slicedURI = source.slice(-6)
        const type = slicedURI?.substring(slicedURI?.indexOf('.')+1)
        setCamera(false)
        setScanned(true)
        detectImage(source, type)
        console.log("picture source", type);
      }
    }
  };
  const cancelPreview = async () => {
    await cameraRef.current.resumePreview();
    setIsPreview(false);
    setVideoSource(null);
  };
  const handleSignout = () => {
    signOut(auth).then(res => {
      setUser(false)
      console.log('Logged out')
    }).catch(e => {
      console.log(e)
    })
  }

  const detectImage = async(file, type) => {
    setIsLoading(true)
    // console.log(type)
    const payload = new FormData()
    payload.append('file', {
        uri: file,
        name: `plant.${type}`,
        type: `image/${type}`
      })
    // console.log(payload._parts)
    axios.post('http://54.215.47.76:3000/predict', payload, {headers: {
      'Content-Type': 'multipart/form-data'
    }})
      .then(res => {
        if(res.data.success == true){
          console.log(res.data)
          if(res.data.predictions.probability >= 0.6){
            setPrediction(res.data.predictions)
            setDisease(res.data.predictions.class)
            if(res.data.predictions.class.includes('healthy')){
              setIsLoading(false)
              setCondition('healthy')
            }else{
              setIsLoading(false)
              setCondition('notHealthy')
            }
          }else{
            setScanned(false)
            setIsLoading(false)
            Alert.alert('Plant not clear', 'Please capture a clear plant')
          }


        }else{
          setIsLoading(false)
          Alert.alert('Error', 'An error occurred while scanning the plant, please try again')
        }
        
      }).catch(e => {
        setScanned(false)
        setIsLoading(false)
        Alert.alert('Scan Error', 'Please select another image to scan')
        console.log('ERROR',e.response.data)
      })
      // console.log('first')
  }
  const clear = () => {
    setScanned(false)
  }
  const pickImage = async () => {
		// console.log('result');
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
		  mediaTypes: ImagePicker.MediaTypeOptions.Images,
		  allowsEditing: true,
		  aspect: [3, 4],
		  quality: 1,
		});
	

		if (!result.canceled) {
      
      const imageURL = result.assets[0].uri
      const slicedURI = imageURL?.slice(-6)
      const type = slicedURI?.substring(slicedURI?.indexOf('.')+1)
			// console.log(type);
      setScanned(true)
      detectImage(imageURL, type)
		  // setImage(imageURL);
		}
	  };

  return (
    <Layout>
      <View
        style={{
          // flex: 1,
          alignItems: "center",
          justifyContent: "center",
          // marginHorizontal: 20,
        }}
      >
        <View style={{ }}>
          <Text style={{alignSelf:'center', marginTop: 50, }} fontWeight='bold' size='h1'>Patho-Tech</Text>
        </View>
        <View style={{flexDirection:'row', marginTop: 50, marginBottom: 50}}>
          <TouchableOpacity onPress={() => handleSignout()} style={{justifyContent:'flex-start', flex:1, marginLeft: 30}}>
            <SimpleLineIcons name="logout" size={24} color={isDarkmode ? "#fff" : '#000'}  />
          </TouchableOpacity>
          {isDarkmode ? (
            <TouchableOpacity onPress={() => {setTheme('light')}}>
            <Feather name='sun' size={24} color='#fff' style={{marginRight: 30}} />
          </TouchableOpacity>
          ):(
            <TouchableOpacity onPress={() => {setTheme('dark')}}>
            <Ionicons name='moon' size={24} color='#000' style={{marginRight: 30}} />
          </TouchableOpacity>
          )}
        </View>
        {!scanned ? (
          <>
          {isLoading ? (
            <Section >
            <SectionContent>
              <ActivityIndicator size={100} color="#00ff00" />
              <Text style={{justifyContent: 'center', alignItems:'center', display:'flex'}}>Scanning...</Text>
            </SectionContent>
          </Section>
          ):(
            <></>
          )}
            
          </>
        ):(
          <>
            {isLoading ? (
              <Section >
              <SectionContent>
                <ActivityIndicator size={100} color="#00ff00" />
                <Text style={{justifyContent: 'center', alignItems:'center', display:'flex'}}>Scanning...</Text>
              </SectionContent>
            </Section>
            ):(
              <>
              {condition == 'healthy' ? (
              <Section style={{width:'85%', }}>
              <SectionContent style={{flexDirection:'column', alignItems:'center'}}>
                <Text fontWeight='bold' style={{fontSize:18}}>Detected plant: <Text> {String(disease)?.substring(0, String(disease)?.indexOf('='))}</Text></Text>
                <Image 
                  resizeMode="contain"
                  style={{
                    height: 200,
                    width: 200,
                  }}
                  source={require('../../assets/good-plant.png')}
                />
                <Text style={{color:'#00cc00', fontSize:20}}>
                  Plant is Healthy
                </Text>
              </SectionContent>
            </Section>
            ):(
              <Section style={{width:'85%',}}>
              <SectionContent style={{flexDirection:'column', alignItems:'center'}}>
                <Text fontWeight='bold' style={{fontSize:18}}>Detected plant: <Text> {String(disease)?.substring(0, String(disease)?.indexOf('='))}</Text></Text>
                <Image 
                  resizeMode="contain"
                  style={{
                    height: 200,
                    width: 200,
                  }}
                  source={require('../../assets/bad-plant.png')}
                />
                <Text style={{color:'#ff0000', fontSize:18}}>
                  Plant Infected by:
                  <Text> {Plants[prediction?.index]}</Text>
                </Text>
              </SectionContent>
            </Section>
            )}</>
            )}
            
            
          </>
        )}
        {camera ? (
          <Section>
          <SectionContent>
            <Camera 
            type={type}
            ref={cameraRef}
            >
              <View style={{flex:0, height:300, width: 300, justifyContent:'center', alignItems:'center'}}>
                {/* <TouchableOpacity onPress={toggleCameraType} style={{justifyContent:'center', alignItems:'center'}}>
                  <Text>Flip Camera</Text>
                </TouchableOpacity> */}
                <TouchableOpacity 
                        style={{justifyContent:'center', }}
                        onPress={takePicture}
                      >
                          <Image 
                            resizeMode="contain"
                            style={{
                              height: 150,
                              width: 150,
                            }}
                            source={require('../../assets/scanner.png')}
                          />
                      </TouchableOpacity>
              </View>
            </Camera>
            <View style={{ alignItems:'center'}}>
            <TouchableOpacity 
                        style={{justifyContent:'center', alignItems:'center'}}
                        onPress={() => {
                          if(camera){
                            setCamera(false)
                          }else{
                            setCamera(true)      
                          }
                        }}
                      >
                        <Image 
                          resizeMode="contain"
                          style={{
                            height: 100,
                            width: 100,
                          }}
                          source={require('../../assets/closeCamera.png')}
                        />
                      </TouchableOpacity>
                      <Text fontWeight="bold">Close Camera</Text>

            </View>
                    
          </SectionContent>
        </Section>
        ):(
          <></>
        )}
        {camera ? (
          <></>
        ):(

       
        <Section style={{marginTop: 30,  }}>
          <SectionContent style={{ }}>
            {scanned ? (
              <Button
              text={"Capture new plant"}
              onPress={() => {clear()}}
              style={{
                marginTop: 10,
              }}
              /> 
            ):(
              <>
            
                {image && <Image source={{uri: image}} style={{flex:1}}/>}
                {camera ? (
                  <></>
                ):(
                  <>
                  <View style={{}}>
                    {isLoading ? (
                      <ActivityIndicator size="large" color="#00ff00" />

                    ):(
                      <></>
                    )}
                
                    <View style={{flexDirection:'column', justifyContent:'center', alignItems:'center', }}>
                      <Text fontWeight="bold" style={{ textAlign: "center" }}>
                        Open Camera to Capture Plant
                      </Text>
                      <TouchableOpacity 
                        style={{justifyContent:'center',}}
                        onPress={() => {
                          if(camera){
                            setCamera(false)
                          }else{
                            setCamera(true)
                          }
                        }}
                      >
                        <Image 
                          resizeMode="contain"
                          style={{
                            height: 150,
                            width: 150,
                          }}
                          source={require('../../assets/scanner.png')}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                    <Text fontWeight="bold" style={{ textAlign: "center", marginTop: 20, marginBottom: 5 }}>
                      Or Select Image to scan
                    </Text>
                    <Button
                    text={"Select Image"}
                    onPress={() => {pickImage()}}
                    style={{
                      marginTop: 10,
                    }}
                    /> 
                
                  </>
                )}
              </>
            )} 
            
          </SectionContent>
        </Section>
         )}
        
      </View>
    </Layout>
  );
}



const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
