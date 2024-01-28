import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, json } from 'react-router-dom'
import Swal from 'sweetalert2'
import PrintTemplate from './PrintTemplate'
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Form, InputGroup } from 'react-bootstrap';

const Billing = () => {

  const apiUrl = process.env.REACT_APP_API_BASE_URL



  const [billdatas, setbilldatas] = useState({
    salesquantity: 0,
    totalamount: "",
    customeramount: "",
    pendingamount: ""
  })

  const [useridforcratedby, setuseridforcratedby] = useState({})

  useEffect(() => {            /// this useeffect localstorage data get
    const storedUserData = JSON.parse(localStorage.getItem('userData'));   // local storage datas 
    if (storedUserData && storedUserData.userid) {
      setuseridforcratedby(storedUserData)
    }
    else {
      setuseridforcratedby({ message: "empty" })
    }
  }, [])
  const createdBy = useridforcratedby.userid || useridforcratedby.message;       // set createdby user


  //  supplier name get code
  const [SupplierName, SetSupplierName] = useState([])

  const [supplierdatas, setsupplierdatas] = useState({ name: [] })

  useEffect(() => {
    const supplierdata = async () => {
      try {
        const res = await axios.get(`${apiUrl}/drop-down-suppliermaster`);
        const SupplierName = res.data.map((datas) => datas.Suppliername);
        setsupplierdatas({ ...supplierdatas, name: SupplierName });
      } catch (err) {
        console.log(err);
      }
    };

    supplierdata(); // Fetch supplier names when component mounts
  }, []);

  //  product get show dropdown code

  const [productalldata, setproductalldata] = useState({ ProducatName: [] })

  useEffect(() => {
    const GetproductName = async () => {
      try {
        const res = await axios.get(`${apiUrl}/drop-down-supplierdatas?SupplierName=${SupplierName[0] || ''}`);
        const Producatname = res.data.map((data) => data.productid);
        setproductalldata({ ...productalldata, ProducatName: Producatname });
      } catch (err) {
        console.log(err);
      }
    };
    GetproductName();
  }, [SupplierName]);

  //  Selected Product Quantity get code
  const [ProductSelection, SetProductSelection] = useState([]);

  const [quantities, setQuantities] = useState([]);

  useEffect(() => {
    const getQuantities = async () => {
      try {
        const promises = ProductSelection.map(async (selectedProduct) => {
          const res = await axios.get(`${apiUrl}/drop-down-supplierquantity?quantity=${selectedProduct || ''}&suppliername=${SupplierName[0] || ''}`);
          return { product: selectedProduct, quantity: res.data[0]?.Qtykg || 0, Amount: res.data[0]?.Amount || 0 };
        });
        const updatedQuantities = await Promise.all(promises);
        setQuantities(updatedQuantities);
      } catch (err) {
        console.log(err);
      }
    };

    if (ProductSelection.length > 0) {
      getQuantities();
    }
  }, [ProductSelection, SupplierName]);


  //  customer name get code
  const [getCustomername, setgetCustomername] = useState({ customername: [] })

  const [customername, setcustomername] = useState([])
  useEffect(() => {
    const CustomerName = async () => {
      try {
        const res = await axios.get(`${apiUrl}/drop-down-Customername`);
        const Customername = res.data.map((data) => data.CustomerName);
        setgetCustomername({ ...getCustomername, customername: Customername });
      } catch (err) {
        console.log(err);
      }
    };
    CustomerName();
  }, [])




  /// total amount calculation
  useEffect(() => {

    const totalamountCalculation = () => {
      const quantityTotal = quantities.map((data) => {
        return data.quantity;
      });

      const TotalAmount = quantities.map((data) => {
        return data.Amount;
      });

      let quantityValue = quantityTotal[0] || 0
      let AmountValue = TotalAmount[0] || 0

      console.log(quantityTotal.join(', '), TotalAmount.join(', '), "total values");

      const oneKgprice = AmountValue / quantityValue;
      const value = Math.round(oneKgprice);

      console.log(value, "kgprice");

      let totalValue = billdatas.salesquantity * value;
      totalValue = totalValue;

      console.log(totalValue, "final amount");


      setbilldatas({ ...billdatas, totalamount: totalValue || 0 })
    }

    totalamountCalculation()



  }, [billdatas.salesquantity, quantities, productalldata])



  const hanldeinsert = (e) => {
    e.preventDefault();
    const existingData = JSON.parse(sessionStorage.getItem('billdatas'));

    const dataArray = Array.isArray(existingData) ? existingData : [];

    const newData = {
      Suppliername: SupplierName[0],
      productname: ProductSelection[0],
      quantitiy: parseInt(billdatas.salesquantity),
      totalamount: billdatas.totalamount
    };

    dataArray.push(newData);

    sessionStorage.setItem('billdatas', JSON.stringify(dataArray));

    const storedUserData = JSON.parse(sessionStorage.getItem('billdatas'));
    settabledata(Array.isArray(storedUserData) ? storedUserData : []);
  }



  const [tabledata, settabledata] = useState([])




  useEffect(() => {
    const tableloaddata = () => {
      const storedUserData = JSON.parse(sessionStorage.getItem('billdatas'));
      settabledata(Array.isArray(storedUserData) ? storedUserData : []);
    }
    tableloaddata();

  }, []);


  const [loader, setloader] = useState(false)

  const handleDelete = (index) => {
    // Copy the existing tabledata
    const updatedTableData = [...tabledata];

    // Remove the row at the specified index
    updatedTableData.splice(index, 1);

    // Update the state with the modified data
    settabledata(updatedTableData);

    // Optionally, update sessionStorage or any other storage mechanism
    sessionStorage.setItem('billdatas', JSON.stringify(updatedTableData));

    totalAmountgrid()
  }



  const [OverallTotalvalue, SetOverallTotalvalue] = useState({
    totalquantity: 0,
    totalAmount: 0
  })


  console.log(OverallTotalvalue, "OverallTotalvalue");
  const totalAmountgrid = () => {
    const overallquantitiy = tabledata.map((data) => data.quantitiy || 0);
    const overallamount = tabledata.map((data) => data.totalamount || 0);
    const sumQuantities = overallquantitiy.reduce((total, quantity) => total + quantity, 0);
    const sumAmounts = overallamount.reduce((total, amount) => total + amount, 0);
    console.log(sumQuantities, "sum of quantities");
    console.log(sumAmounts, "sum of amounts");

    SetOverallTotalvalue({
      totalquantity: sumQuantities,
      totalAmount: sumAmounts
    });
  };

  useEffect(() => {
    totalAmountgrid();
  }, [tabledata]);

  return (
    <div>
      <div className="enquiry-container d-flex align-items-center justify-content-center position-relative ">
        <div className="spiner-loader position-absolute">
          <div className="mesh-loader" style={{ display: loader ? "flex" : "none", zIndex: "1" }}>
            <div className="set-one">
              <div className="circle"></div>
              <div className="circle"></div>
            </div>
            <div className="set-two">
              <div className="circle"></div>
              <div className="circle"></div>
            </div>
          </div>
        </div>
        <form action="" className='bg-transparent border rounded  p-3 col-20 col-lg-8 col-xl-7 row' style={{ opacity: loader ? "0.1" : "1" }} onSubmit={hanldeinsert}>
          <div className="head text-center ">
            <h1 className='text-2xl mb-1 '>Billing</h1>
            <hr className='mb-2' />
          </div>
          <Form.Group className='col-12 col-md-6 col-lg-6 col-xl-6 mb-3'>
            <Form.Label>Supplier Name</Form.Label>
            <Typeahead
              id="basic-typeahead-single"
              labelKey="name"
              onChange={SetSupplierName}
              options={supplierdatas.name}
              placeholder="Enter Supplier Name"
              selected={SupplierName}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6 col-lg-6 col-xl-6 mb-2">
            <Form.Label>Select The Product</Form.Label>
            <Typeahead
              id="basic-typeahead-multiple"
              labelKey="ProducatName"
              multiple
              options={productalldata.ProducatName}
              onChange={SetProductSelection}
              placeholder="Choose Your Product"
              selected={ProductSelection}
            />
          </Form.Group>

          <div className={`quantity-of-product col-12 col-md-6 col-lg-10 col-xl-12 gap-4 mb-2 d-flex flex-wrap ${ProductSelection.length > 0 ? 'd-flex' : 'd-none'}`} >
            {quantities.map((data, index) => (
              data.quantity !== '' && (
                <Form.Label key={index} className='col flex-wrap'>{data.product} available Quantity
                  <InputGroup className="mb-3 mt-2" key={index}>
                    <Form.Control
                      placeholder="Product available Quantity"
                      aria-label="Quantity"
                      aria-describedby="basic-addon1"
                      readOnly
                      value={"Quantity :  " + data.quantity + "Kg" + "        " + "Amount : " + data.Amount}
                    />
                    <InputGroup.Text id="basic-addon1" key={index}>Kg   and  ₹‎</InputGroup.Text>
                  </InputGroup>
                </Form.Label>
              )
            ))}
          </div>


          <Form.Group className='col-12 col-md-6 col-lg-6 col-xl-6 mb-3'>
            <Form.Label>Customer Name</Form.Label>
            <Typeahead
              id="basic-typeahead-single"
              labelKey="customername"
              onChange={setcustomername}
              options={getCustomername.customername}
              placeholder="Enter Customer Name"
              selected={customername}
            />
          </Form.Group>

          <div className="total-amount col-12 col-md-6 col-lg-6 col-xl-6 mb-2">
            <Form.Label>Pending Amount</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Enter Amount"
                aria-label="totalamount"
                aria-describedby="basic-addon1"
                value={0}
                readOnly
              />
              <InputGroup.Text id="basic-addon1">₹‎</InputGroup.Text>
            </InputGroup>
          </div>

          <div className="toal-quantity col-12 col-md-6 col-lg-6 col-xl-6 mb-2">
            <Form.Label >Sales Quantity</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Enter Sales Quantity"
                aria-label="Quantity"
                aria-describedby="basic-addon1"
                onChange={(e) => setbilldatas({ ...billdatas, salesquantity: e.target.value })}
              />
              <InputGroup.Text id="basic-addon1" >Kg</InputGroup.Text>
            </InputGroup>

          </div>




          <div className="total-amount col-12 col-md-6 col-lg-6 col-xl-6 mb-2">
            <Form.Label>Total Amount</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Enter Amount"
                aria-label="totalamount"
                aria-describedby="basic-addon1"
                value={billdatas.totalamount}

                readOnly
              />
              <InputGroup.Text id="basic-addon1">₹‎</InputGroup.Text>
            </InputGroup>
          </div>


          {/* <div className="amount col-12 col-md-6 col-lg-6 col-xl-6 mb-2">
            <Form.Label>Enter Amount</Form.Label>
            <InputGroup className="mb-3 ">
              <Form.Control
                placeholder="Enter Amount"
                aria-label="Username"
                aria-describedby="basic-addon1"
                onChange={(e) => setbilldatas({ ...billdatas, totalamount: e.target.value })}
              />
              <InputGroup.Text id="basic-addon1">₹‎</InputGroup.Text>
            </InputGroup>
          </div> */}


          <div className="save-btn d-flex justify-content-center ">
            <button className='btn btn-success col-6'>Save Data</button>
          </div>
        </form>
      </div>


      <div className="table-company-datas mt-32 mt-lg-0 mt-xl-5 mt-md-0">
        <div className="overflow-auto rounded-lg shadow hidden d-flex ">
          <table className="w-full table-hover">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="w-30 p-3 text-sm font-semibold tracking-wide text-left">Sno</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center">Supplier Name</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center">Product Name</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center">Quantity</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center">Amount</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tabledata.map((data, index) => {
                return <tr className="bg-white" key={index}>

                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                    <p className="font-bold text-blue-500 hover:underline">{index}</p>
                  </td>

                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                    {data.Suppliername}
                  </td>

                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                    {data.productname}
                  </td>

                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                    {data.quantitiy}
                  </td>

                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                    {data.totalamount}
                  </td>

                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                    <button className='btn btn-danger' onClick={() => handleDelete(index)}>Delete</button>
                  </td>
                </tr>
              })}
            </tbody>
            <tfoot>
              <tr className="bg-white border " >
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">

                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">

                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">

                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-start">
                 <p className='ps-4'>Total Quantity : <span className=' fw-semibold fs-5 mt-3'>{OverallTotalvalue.totalquantity}</span> </p> 
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-start">
                 <p className='ps-4'>Total Amount : <span className=' fw-semibold fs-5 mt-3'>{OverallTotalvalue.totalAmount}</span></p> 
                </td>
                <td className="p-3 text-sm text-gray-700 whitespace-nowrap text-center">
                  Total Amount
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>


    </div>
  )
}

export default Billing
