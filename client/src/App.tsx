import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom"
// import Footer from "./components/Footer.js"
import Footer from "./components/Footer.js"
import Navbar from "./components/Navbar.js"
import SignIn from "./views/SignIn.js"
import Signup from "./views/Signup.js"

function App() {

  return (
<>
    <Navbar />

        <BrowserRouter>


  <Routes>
            {/* <Route path="/home" element={<Home />} />
            <Route
            path="about"
              element={
                <React.Suspense fallback="Loading ...">
                  <LazyAbout />
                </React.Suspense>
              }
            />
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
            <Route path="/" element={<SignIn />} />
            <Route path="/signup" element={<Signup />} />
            {/* <Route path="*" element={<NoMatch />} /> */}
          </Routes>
        </BrowserRouter>
              <Footer/>
              </>

              )
}

export default App
