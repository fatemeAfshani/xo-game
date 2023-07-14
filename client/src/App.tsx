import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthProvider from './components/context/AuthContext.js';
import Footer from './components/Footer.js';
import Header from './components/Header.js';
import RequireAuth from './components/RequireAuth.js';
import Home from './views/Home.js';
import SignIn from './views/SignIn.js';
import Signup from './views/Signup.js';

const LazyPlayGround = React.lazy(() => import('./views/PlayGround.js'));
const LazyWaiting = React.lazy(() => import('./views/WaitingRoom.js'));

function App() {
  return (
    <>
      {/* <Navbar />
       */}
      <AuthProvider>
        <Header />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Home />{' '}
                </RequireAuth>
              }
            />

            <Route
              path="playground"
              element={
                <RequireAuth>
                  <React.Suspense fallback="Loading ...">
                    <LazyPlayGround />
                  </React.Suspense>
                </RequireAuth>
              }
            />

            <Route
              path="waiting"
              element={
                <RequireAuth>
                  <React.Suspense fallback="Loading ...">
                    <LazyWaiting />
                  </React.Suspense>
                </RequireAuth>
              }
            />
            {/*
            <Route path="order-summery" element={<OrderSummery />} />
            <Route path="products" element={<Product />}>
            <Route index element={<FeatureProducts />} />
              <Route path="featured" element={<FeatureProducts />} />
              <Route path="new" element={<NewProducts />} />
              </Route>
              <Route path="products/:id" element={<ProductDetail />} />
              <Route
              path="profile"
              element={
                <RequireAuth>
                  <Profile />
                  </RequireAuth>
                }
              /> */}
            <Route path="signin" element={<SignIn />} />
            <Route path="signup" element={<Signup />} />
            {/* <Route path="*" element={<NoMatch />} /> */}
          </Routes>
        </BrowserRouter>
        <Footer />
      </AuthProvider>
    </>
  );
}

export default App;
