# CosmoArchitects 🌌        
# **Interactive Orrery Web App**            
              
## **Overview**          
This project is our submission for the **2024 NASA Space Apps Challenge**. Our aim is to create an interactive orrery web app that visualizes celestial bodies such as planets, Near-Earth Asteroids (NEAs), Near-Earth Comets (NECs), and Potentially Hazardous Asteroids (PHAs) in our solar system. The orrery offers both a static view and a dynamic, animated model that showcases the orbital paths and positions of these celestial bodies over time.
      
The web app is designed to educate users about celestial objects, with features that allow real-time exploration of planetary and asteroid data, supported by NASA’s publicly available datasets.

### **Event**: 2024 NASA Space Apps Challenge  
### **Categories**: Astrophysics, Space Exploration, Software, Games, Planets & Moons  
### **Difficulty Level**: Intermediate to Advanced.

---
     
## **Features**

- **Interactive 3D Visualization**: View the solar system in an interactive manner with the ability to zoom, pan, and rotate.
- **Real-time Celestial Body Data**: Visualize the position of planets, NECs, NEAs, and PHAs using NASA's Keplerian parameters.
- **Orbital Trajectories**: Explore the colored orbital trajectories of celestial bodies, with options to enable/disable specific orbits.
- **Speed & Timeline Control**: Control the speed of the simulation and jump to a specific date to observe the solar system at any given time.
- **Labels and Views**: Toggle labels for celestial objects and switch between exterior and interior spaceship views.
- **AI-Powered Orbit Calculation**: Leverage AI tools for code generation and accurate calculation of orbital parameters for dynamic simulations.

---

## **Technologies Used**  

- **3D Graphics**: Built using open-source 3D graphics libraries like Three.js/WebGL.
- **NASA Data Integration**: Celestial body data retrieved from NASA’s Small Body Database and other public datasets.
- **Orbital Propagator**: Implemented to calculate real-time movement of celestial bodies in the dynamic orrery.
- **Web Application**: Developed as a web-based application, ensuring accessibility across multiple browsers (tested on Chrome, Firefox, Safari).
- **AI Assistance**: Utilized AI to assist with orbit generation and handling data for real-time simulations.

---   

## **Installation and Setup**

To run the project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/KhamessiTaha/CosmoArchitects.git
   cd CosmoArchitects
   cd cosmoarchitects-frontend
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
- **Additional NASA APIs**: Used for planet position data and additional celestial information.

---

## **Objectives**

The main objectives for this project are:

- **Interactive Education**: Provide a visual and interactive platform for users to learn about the solar system and its celestial bodies.
- **Real-time Orbit Visualization**: Accurately represent the position of celestial objects at any given time.
- **User Engagement**: Enable users to explore and manipulate the visualization by controlling time, speed, and the point of view in the orrery.
- **AI in Astronomy**:
- ## **Data Sources and Resources**

- **NASA’s Small Body Database**: Used for retrieving Keplerian parameters and orbital data for NECs, NEAs, and PHAs.
- **Keplerian Parameters Tutorial**: Followed the guidelines for using eccentricity, semi-major axis, inclination, argument of periapsis, true anomaly, and more to calculate elliptical orbits.
- **Additional NASA APIs**: Used for planet position data and additional celestial information.

---

## **Objectives**

The main objectives for this project are:

- **Interactive Education**: Provide a visual and interactive platform for users to learn about the solar system and its celestial bodies.
- **Real-time Orbit Visualization**: Accurately represent the position of celestial objects at any given time.
- **User Engagement**: Enable users to explore and manipulate the visualization by controlling time, speed, and the point of view in the orrery.
- **AI in Astronomy**: Demonstrate the use of AI in developing tools for space exploration and astronomy education.

---

## **How to Use the Web App**

1. **Navigation**: Use mouse controls or touch gestures to pan, zoom, and rotate around the solar system.
2. **Control Panel**: Utilize the control panel to switch between labels, toggle orbital paths, and control the simulation speed.
3. **Time Travel**: Move the timeline slider to observe the celestial positions at any past or future date.
4. **Explore Near-Earth Objects**: Use the object filter to focus on Near-Earth Objects (NEOs) such as asteroids or comets.
5. **AI Features**: The orbit calculation in real-time is AI-generated, making predictions for future orbits based on current parameters.

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
- **AI Tools**: Special thanks to AI tools used for orbit propagation code generation.

---

## **License**

This project is licensed under the LGPL-2.1 license - see the [LICENSE](./LICENSE) file for details.

---

## **Links**

- [NASA Small Body Database](https://ssd.jpl.nasa.gov/sbdb_query.cgi)

