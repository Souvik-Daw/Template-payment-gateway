import './App.css';
import axios from 'axios'
import React, { useRef,useEffect } from 'react';

function App() {
  const [responseId, setResponseId] = React.useState("");
  const [responseState, setResponseState] = React.useState([]);

  const inputRef = useRef();

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");

      script.src = src;

      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }

      document.body.appendChild(script);
    })
  }

  const createRazorpayOrder = (e) => {

    var amt = inputRef.current.value;
    console.log(inputRef.current.value);

    let data = JSON.stringify({
      amount: amt * 100,
      currency: "INR"
    })

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://localhost:5000/orders",
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    }

    axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data))
      handleRazorpayScreen(response.data.amount)
    })
    .catch((error) => {
      console.log("error at", error)
    })
  }

  const handleRazorpayScreen = async(amount) => {
    const res = await loadScript("https:/checkout.razorpay.com/v1/checkout.js")

    if (!res) {
      alert("Some error at razorpay screen loading")
      return;
    }

    const options = {
      key: 'rzp_test_ZFSzN57ZBuadQ2',
      amount: amount,
      currency: 'INR',
      name: "Koding Circle",
      description: "payment to Koding Circle",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQEd_11woxVIww/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1722857419584?e=2147483647&v=beta&t=gIWPwpjSWRHrEXSrf92ozGtRwPyK2ks0JaNZeT6ihcw",
      handler: function (response){
        setResponseId(response.razorpay_payment_id)
      },
      prefill: {
        name: "example",
        email: "example@gmail.com"
      },
      theme: {
        color: "#F4C430"
      }
    }

    const paymentObject = new window.Razorpay(options)
    paymentObject.open()
  }

  const paymentFetch = (e) => {
    e.preventDefault();

    const paymentId = e.target.paymentId.value;

    axios.get(`http://localhost:5000/payment/${paymentId}`)
    .then((response) => {
      console.log(response.data);
      setResponseState(response.data)
    })
    .catch((error) => {
      console.log("error occures", error)
    })
  }

  // useEffect(() => {
  //   let data = JSON.stringify({
  //     amount: amount * 100,
  //   })

  //   let config = {
  //     method: "post",
  //     maxBodyLength: Infinity,
  //     url: `http://localhost:5000/capture/${responseId}`,
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     data: data
  //   }

  //   axios.request(config)
  //   .then((response) => {
  //     console.log(JSON.stringify(response.data))
  //   })
  //   .catch((error) => {
  //     console.log("error at", error)
  //   })
  // }, [responseId])

  return (
    <div className="App">
      <input type="text" ref={inputRef} name="amount" id='amount' />
      <button onClick={() => createRazorpayOrder()}>Pay</button>
      {responseId && <p>{responseId}</p>}
      <h1>This is payment verification form</h1>
      <form onSubmit={paymentFetch}>
        <input type="text" name="paymentId" />
        <button type="submit">Fetch Payment</button>
        {responseState.length !==0 && (
          <ul>
            <li>Amount: {responseState.amount / 100} Rs.</li>
            <li>Currency: {responseState.currency}</li>
            <li>Status: {responseState.status}</li>
            <li>Method: {responseState.method}</li>
          </ul>
        )}
      </form>
    </div>
  );
}

export default App;
