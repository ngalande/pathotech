import React, { useEffect, useState } from "react";
import { View, Linking, StyleSheet, TouchableOpacity } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { SimpleLineIcons, Feather, Ionicons  } from '@expo/vector-icons';
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

export default function ({ navigation }) {
  const [type, setType] = useState(CameraType.back);
  const { isDarkmode, setTheme } = useTheme();
  const [camera, setCamera] = useState(false)
  const [permission, requestPermission] = Camera.useCameraPermissions();

  useEffect(() => {
    if(!isDarkmode){
      setTheme('dark')
    }
  }, [])
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
          <TouchableOpacity onPress={() => {signOut(auth)}} style={{justifyContent:'flex-start', flex:1, marginLeft: 30}}>
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
        {camera ? (
          <Section>
          <SectionContent>
            <Camera type={type}>
              <View style={{flex:0, height:300, width: 300}}>
                <TouchableOpacity onPress={toggleCameraType}>
                  <Text>Flip Camera</Text>
                </TouchableOpacity>
              </View>
            </Camera>
          </SectionContent>
        </Section>
        ):(
          <></>
        )}
        <Section style={{marginTop: 20}}>
          <SectionContent>
            <Text fontWeight="bold" style={{ textAlign: "center" }}>
              Open Camera to Capture Plant
            </Text>

            
            <Button
              text={camera ? "Close Camera" : "Open Camera"}
              onPress={() => {
                if(camera){
                  setCamera(false)
                }else{
                  setCamera(true)

                }
              }}
              style={{
                marginTop: 10,
              }}
            /> 
            
            
          </SectionContent>
        </Section>
        
        
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