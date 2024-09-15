import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #0D1B2A;
  color: #E0E1DD;
`;

const Home = () => {
  return (
    <Container>
      <h1>Welcome to CosmoArchitects!</h1>
      <p>Explore exoplanets like never before.</p>
    </Container>
  );
};

export default Home;
