import { Link } from "react-router-dom";

export default function SignIn() {
  return (
    <div className="login template d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className=" rounded p-5 bg-blue  ">

      <form>
        <h3 className="text-center">Sign In</h3>

        <div className="my-3">
          <label htmlFor="username">Username</label>
          <input type="text" placeholder=" username"  className="form-control"/>
        </div>

           <div className="mb-3">
          <label htmlFor="password">Password</label>
          <input type="password" placeholder=" password"  className="form-control"/>
        </div>
        <div className="d-grid my-4">
          <button className="btn btn-dark rounded">Sign In</button>
        </div>
      </form>
      <p className="text-right">
        Don't have an account ?   <Link to='/signup'> Click Here</Link>
      </p>
      </div>
    </div>
  )
}


