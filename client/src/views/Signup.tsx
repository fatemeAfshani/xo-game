import { Link } from "react-router-dom";

export default function Signup() {
  return (
       <div className="signup template d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className=" rounded p-5 bg-blue  ">

      <form>
        <h3 className="text-center">Sign Up</h3>

        <div className="my-3">
          <label htmlFor="username">Username</label>
          <input type="text" placeholder=" username"  className="form-control"/>
        </div>

           <div className="mb-3">
          <label htmlFor="password">Password</label>
          <input type="password" placeholder=" password"  className="form-control"/>
        </div>

        <div className="mb-3">
          <label htmlFor="password">Repeat Password</label>
          <input type="password" placeholder="repeat password"  className="form-control"/>
        </div>
        <div className="d-grid my-4">
          <button className="btn btn-dark rounded">Sign Up</button>
        </div>
      </form>
      <p className="text-right">
        Already have an account ?   <Link to='/'> Click Here</Link>
      </p>
      </div>
    </div>
  )
}
