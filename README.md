# CosmoArchitects - CosmicVue🌌              
                    
![logo](https://github.com/user-attachments/assets/789b7dfb-af06-4093-a636-fb66e06c6ad9)  
 

# **Interactive Orrery Web App**      

Demo is Live on Netlify [Demo](https://cosmicvue.netlify.app/) .

                                        
## **Overview**                 
This project is our submission for the **2024 NASA International Space Apps Challenge**. It showcases an interactive orrery web app designed to visualize celestial bodies such as planets, Near-Earth Asteroids (NEAs) including Potentially Hazardous Asteroids (PHAs), Near-Earth Comets (NECs),  within our solar system.

The app features a dynamic, animated model that traces the orbital paths and positions of these celestial bodies over time, utilizing real-time data. Our goal is to educate users about these objects through an intuitive, 3D visualization tool supported by NASA's public datasets.

### **Event**: 2024 NASA Space Apps Challenge  
### **Categories**: Astrophysics, Space Exploration, Software, Games, Planets & Moons  
### **Difficulty Level**: Intermediate to Advanced.

---
     
## **Features**

- **Interactive 3D Visualization**: View the solar system in an interactive manner with the ability to zoom, pan, and rotate.
- **NASA's Celestial Body Data**: Visualize the position of planets, NECs, NEAs, and PHAs using NASA's Keplerian parameters.
- **Orbital Trajectories**: Explore the colored orbital trajectories of celestial bodies, with options to enable/disable specific orbits.
- **Speed & Timeline Control**: Control the speed of the simulation to observe the solar system at different speeds.
- **Labels and Views**: Toggle labels for celestial objects (NEOs).

---

## **Technologies Used**  

- **3D Graphics**: Built using open-source 3D graphics library Three.js.
- **NASA Data Integration**: Celestial body data retrieved from NASA’s Small Body Database and other public datasets/APIs.
- **Orbital Propagator**: Implemented to calculate real-time movement of celestial bodies in the dynamic orrery.
- **Web Application**: Developed as a web-based application, ensuring accessibility across multiple browsers (tested on Chrome, Firefox, Safari) and devices.

---   

## **Installation and Setup**

To run the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/KhamessiTaha/CosmoArchitects.git
   cd CosmoArchitects
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```


3. Run the development server:
   ```bash
   npm run start
   ```
4. Open your browser and navigate to http://localhost:3000.

## **Data Sources and Resources**

- **NASA’s Small Body Database**: Used for retrieving Keplerian parameters and orbital data for NECs, NEAs, and PHAs.
- **Keplerian Parameters Tutorial**: Followed the guidelines for using eccentricity, semi-major axis, inclination, argument of periapsis, true anomaly, and more to calculate elliptical orbits.
- **Additional NASA APIs**: NASA's Horizon API/NASA's Open API Used for planet position data and additional celestial information.

---

## **Objectives**

The main objectives for this project are:

- **Interactive Education**: Provide a visual and interactive platform for users to learn about the solar system and its celestial bodies.
- **Real-time Orbit Visualization**: Accurately represent the position of celestial objects at any given time.
- **User Engagement**: Enable users to explore and manipulate the visualization by controlling time, speed, and the point of view in the orrery.


---



## **How to Use the Web App**

1. **Navigation**: Use mouse controls or touch gestures to pan, zoom, and rotate around the solar system.
2. **Control Panel**: Utilize the control panel to switch between labels, toggle orbital paths, and control the simulation speed.
3. **Time Travel**: Click the 'Faster' or 'Slower' buttons to observe the celestial movements at different speeds.
4. **Explore Near-Earth Objects**: Use the object filter to focus on Near-Earth Objects (NEOs) such as asteroids or comets.

---

## **Future Improvements**

- **Enhanced AI Orbit Predictions**: Further improve AI-generated orbits with more accurate long-term trajectory predictions.
- **Expanded Object Database**: Include more detailed data for additional celestial bodies.
- **Mobile-Friendly UI**: Optimize the web app for mobile devices to enhance accessibility.

---

## **Contributing**

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request. Make sure to follow the guidelines outlined in the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

---

## **Acknowledgments**

- **NASA**: For the publicly available datasets and the resources that made this project possible.
- **Three.js**: For the 3D graphics engine that powers the visualization.
- **AI Tools**: Special thanks to AI tools used for code debugging :D.

---

## **License**

This project is licensed under the LGPL-2.1 license - see the [LICENSE](./LICENSE) file for details.

---

## **Links**

- [NASA Small Body Database](https://ssd.jpl.nasa.gov/sbdb_query.cgi)
