const express = require("express");
const cors = require("cors");
const mysql = require('mysql');
const server = express();
server.use(cors());
server.use(express.json());


const PORT = process.env.PORT || 3002;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "billing"
})



// Login Querys 

server.get('/forgetpassword', (req, res) => {
  const value = "A"
  db.query(`select usercode from billing.usermaster  where userstatus ='${value}'`, (err, result) => {
    if (err) {
      console.log(err, 'forgetpassword');
    }
    else {
      res.send(result)
    }
  })
})

server.put('/forgetpassword-change', (req, res) => {
  const { usercode, newpassword, confirmpassword } = req.body;
  db.query(
    `UPDATE billing.dbo.usermaster 
    SET password = '${newpassword}', confirmpassword = '${confirmpassword}' 
    WHERE usercode = '${usercode}'`,
    (err, result) => {
      if (err) {
        console.log(err, 'forgetpassword-change');
      } else {
        res.send(result);
      }
    }
  );
});

server.put('/changepassword', (req, res) => {
  const { newpassword, confirmpassword, usercode } = req.body
  db.query(`UPDATE billing.dbo.usermaster SET password = '${newpassword}', confirmpassword = '${confirmpassword}' WHERE usercode = '${usercode}'`, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  })
});


server.get('/login', async (req, res) => {
  const name = req.query.name;
  try {
    const result = await db.query`SELECT um.userid,um.usercode,um.username,um.userstatus,utype.Description,um.password FROM usermaster um JOIN usertypemaster utype  ON um.usertype = utype.usertypeid WHERE um.usercode = ${name}`;
    console.log(result);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error occurred');
  }
});

server.get('/getcompany_data', (req, res) => {
  db.query('SELECT row_number()over(order by companyid desc)Sno,companyname,status,companyid FROM BILLING.companymaster', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});

server.get('/getbranch_data', (req, res) => {
  db.query('SELECT row_number()over(order by branchid desc)Sno,branchname,status,branchid FROM BILLING.branchmaster', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});

server.get('/getproduct_data', (req, res) => {
  db.query('SELECT row_number()over(order by productid desc)Sno,productname,status,productid,brachid FROM billing.product_master', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});


server.get('/getsupplier_data', (req, res) => {
  db.query('SELECT row_number()over(order by productid desc)Sno,Supplierid,Suppliername,Address,phoneno,brachid,Qtykg,Amount,productid,status FROM billing.suppliermaster', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});


server.get('/getcustomer_data', (req, res) => {
  db.query('SELECT row_number()over(order by Customerid desc)Sno,CustomerName,Address,phoneno,status,Customerid FROM billing.Customer_Matser', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});


server.get('/companyprofile', (req, res) => {
  const status = 'a'
  db.query(`SELECT row_number()over(order by Compinfoid desc) Sno,Compinfoid,Companyname,Address1,Address,Pincode,State,District,CompanyPhoto  FROM gym_main.companyprofileinfo where delstatus = '${status}'ORDER BY Compinfoid DESC LIMIT 1`, (err, result) => {
    if (err)
      throw err
    else {
      res.send(result)
    }
  })
})


//  insert query
server.post('/post', (req, res) => {
  const { company_name, status, createdby } = req.body
  console.log(company_name, status, createdby);

  const reg = /[^'"\\]+/g;
  var value = company_name.replace(reg, company_name);

  db.query(
    `INSERT INTO billing.companymaster(companyname,status,createdby) VALUES('${value}','${status}','${createdby}') `,
    (err, result) => {
      if (err) {
        const errorMessage = `Error inserting data Companymaster Page: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}`;
        const date = `${currentDate}`;
        db.query(
          `INSERT INTO attendance.err_log(error_logs, date) 
          VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
            } else {
              res.send(Result)
            }
          }
        );
      } else {
        console.log(result, "sucesss");
        res.status(200).send('Data inserted successfully');
      }
    }
  );
});

server.post('/branch_post', (req, res) => {
  const { companyid, branchname, status, createdBy } = req.body;

  const reg = /[^'"\\]+/g;
  var value = branchname.replace(reg, branchname);

  db.query(
    `INSERT INTO billing.branchmaster(companyid, branchname, status, createdby) 
    VALUES ('${companyid}', '${value}', '${status}','${createdBy}')`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error inserting data Branchmaster Page: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}`;
        const date = `${currentDate}`;
        db.query(
          `INSERT INTO attendance.err_log(error_logs, date) 
          VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
            } else {
              res.send(Result)
            }
          }
        );
        res.status(500).send('Error inserting data');
      } else {
        console.log(result);
        res.status(200).send('Data inserted successfully');
      }
    }
  );
});

server.post('/Product_post', (req, res) => {
  const status = 'Active'
  const { branchid, productname, createdBy } = req.body;

  const reg = /[^'"\\]+/g;
  var value = productname.replace(reg, productname);

  db.query(
    `INSERT INTO billing.product_master(brachid, productname, status, createdby) 
    VALUES ('${branchid}', '${value}', '${status}','${createdBy}')`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error inserting data Branchmaster Page: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}`;
        const date = `${currentDate}`;
        db.query(
          `INSERT INTO attendance.err_log(error_logs, date) 
          VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
            } else {
              res.send(Result)
            }
          }
        );
        res.status(500).send('Error inserting data');
      } else {
        console.log(result);
        res.status(200).send('Data inserted successfully');
      }
    }
  );
});


server.post('/supplier_post', (req, res) => {

  const status = 'Active'
  const { Suppliername, Address, ProductId, phoneno, Qtykg, Amount, createdBy } = req.body

  console.log(Suppliername, Address, ProductId, phoneno, Qtykg, Amount, createdBy);

  const reg = /[^'"\\]+/g;
  var SuppliernameReg = Suppliername.replace(reg, Suppliername);
  var AddressReg = Address.replace(reg, Address);

  const query = `INSERT INTO billing.suppliermaster(Suppliername,Address,phoneno,createdby,brachid,Qtykg,Amount,productid,status)
   VALUES('${SuppliernameReg}','${AddressReg}','${phoneno}','${createdBy}','','${Qtykg}','${Amount}','${ProductId}', '${status}')`

  db.query(query, (err, result) => {
    if (err) {
      const errorMessage = `Error inserting data: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            res.send(error)
            console.log(error);
          } else {
            res.send(Result)
          }
        }
      );
      console.log(err);
      res.status(500).send('Error inserting data');
    }
    else {
      res.send(result)
    }
  })
})


server.post('/Customer_post', (req, res) => {

  const status = 'Active'
  const { customername, Address, phoneno, createdBy } = req.body


  const reg = /[^'"\\]+/g;
  var SuppliernameReg = customername.replace(reg, customername);
  var AddressReg = Address.replace(reg, Address);

  const query = `INSERT INTO billing.Customer_Matser(CustomerName,Address,phoneno,createdby,brachid,status)
   VALUES('${SuppliernameReg}','${AddressReg}','${phoneno}','${createdBy}','','${status}')`

  db.query(query, (err, result) => {
    if (err) {
      const errorMessage = `Error inserting data: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            res.send(error)
            console.log(error);
          } else {
            res.send(Result)
          }
        }
      );
      console.log(err);
      res.status(500).send('Error inserting data');
    }
    else {
      res.send(result)
    }
  })
})

server.post('/CompanyProfile_post', (req, res) => {

  const status = 'a'
  const { Companyname, Address1, Address, Pincode, State, District, CompanyPhoto, createdBy } = req.body

  const reg = /[^'"\\]+/g;
  var CompanynameReg = Companyname.replace(reg, Companyname);
  var Address1Reg = Address1.replace(reg, Address1);
  var AddressReg = Address.replace(reg, Address);
  var StateReg = State.replace(reg, State);
  var DistrictReg = District.replace(reg, District);
  const query = `INSERT INTO billing.companyprofileinfo(Companyname,Address1,Address,Pincode,State,District,CompanyPhoto,Createdby,delstatus)
   VALUES('${CompanynameReg}','${Address1Reg}','${AddressReg}','${Pincode}','${StateReg}','${DistrictReg}','${CompanyPhoto}','${createdBy}','${status}')`

  db.query(query, (err, result) => {
    if (err) {
      const errorMessage = `Error inserting data: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            res.send(error)
          } else {
            res.send(Result)
          }
        }
      );
      res.status(500).send('Error inserting data');
    }
    else {
      res.send(result)
    }
  })
})






// Update query

server.put('/updatecompanydata/:id', (req, res) => {
  const id = req.params.id
  const date = new Date().toLocaleString();
  const { company_name, status, createdBy } = req.body

  const reg = /[^'"\\]+/g;
  var CompanynameReg = company_name.replace(reg, company_name);

  db.query(`UPDATE billing.companymaster SET companyname = '${CompanynameReg}' , status = '${status}' , updatedate = '${date}', createdby = '${createdBy}' where companyid = ${id}`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error update data from updatecompanydata: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}\n`;
        const date = `${currentDate}`
        db.query(
          `INSERT INTO billing.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
            } else {
              res.send(Result)
            }
          }
        );
        res.status(500).send('Error inserting data');
      }
      else {
        console.log(result);
        res.send(result)
      }
    })
})

server.put('/updatebranchdata/:id', (req, res) => {
  const id = req.params.id
  const date = new Date().toLocaleString();
  const { branch_name, status, companyid, createdBy } = req.body

  const reg = /[^'"\\]+/g;
  var RegValue = branch_name.replace(reg, branch_name);

  db.query(`UPDATE billing.branchmaster SET companyid = ${companyid}, branchname = '${RegValue}' , status = '${status}' , updatedate = '${date}' , createdby = '${createdBy}' where branchid = ${id}`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error Update data from updatebranchdata: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}\n`;
        const date = `${currentDate}`
        db.query(
          `INSERT INTO billing.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
            } else {
              res.send(Result)
            }
          }
        );
        res.status(500).send('Error Update data');
      }
      else {
        console.log(result);
        res.send(result)
      }
    })
})


server.put('/updateproductdata/:id', (req, res) => {
  const id = req.params.id
  const { productname, branchid, createdBy } = req.body

  const reg = /[^'"\\]+/g;
  var RegValue = productname.replace(reg, productname);

  db.query(`UPDATE billing.product_master SET brachid = ${branchid}, productname = '${RegValue}', createdby = '${createdBy}' where productid = ${id}`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error Update data from updatebranchdata: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}\n`;
        const date = `${currentDate}`
        db.query(
          `INSERT INTO billing.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
            } else {
              res.send(Result)
            }
          }
        );
        res.status(500).send('Error Update data');
      }
      else {
        console.log(result);
        res.send(result)
      }
    })
})


server.put('/updatesupplierdata/:id', (req, res) => {
  const id = req.params.id
  const { Suppliername, Address, createdBy, phoneno, Qtykg, Amount, productid } = req.body

  const reg = /[^'"\\]+/g;
  var RegValue = Suppliername.replace(reg, Suppliername);
  var RegAddress = Address.replace(reg, Address);

  db.query(`UPDATE billing.suppliermaster SET Suppliername = '${RegValue}', Address = '${RegAddress}', phoneno = '${phoneno}', createdby = '${createdBy}',
  Qtykg = '${Qtykg}',Amount = '${Amount}',productid = '${productid}' where Supplierid = ${id}`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error Update data from updatebranchdata: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}\n`;
        const date = `${currentDate}`
        db.query(
          `INSERT INTO billing.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
              console.log(error);
            } else {
              res.send(Result)
            }
          }
        );
        console.log(err);
        res.status(500).send('Error Update data');
      }
      else {
        console.log(result);
        res.send(result)
      }
    })
})

server.put('/updatecustomerdata/:id', (req, res) => {
  const id = req.params.id
  const { customername, Address, createdBy, phoneno } = req.body

  const reg = /[^'"\\]+/g;
  var RegValue = customername.replace(reg, customername);
  var RegAddress = Address.replace(reg, Address);

  db.query(`UPDATE billing.Customer_Matser SET customername = '${RegValue}', Address = '${RegAddress}', phoneno = '${phoneno}', createdby = '${createdBy}' where Customerid = ${id}`,
    (err, result) => {
      if (err) {
        const errorMessage = `Error Update data from updatebranchdata: ${err}`;
        const currentDate = new Date().toLocaleString();
        const logData = `${errorMessage}\n`;
        const date = `${currentDate}`
        db.query(
          `INSERT INTO billing.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
          (error, Result) => {
            if (error) {
              res.send(error)
              console.log(error);
            } else {
              res.send(Result)
            }
          }
        );
        console.log(err);
        res.status(500).send('Error Update data');
      }
      else {
        console.log(result);
        res.send(result)
      }
    })
})


server.put('/updatecompanyprofile/:id', (req, res) => {
  const id = req.params.id;
  const { Companyname, Address1, Address, Pincode, State, District, CompanyPhoto, createdBy } = req.body;

  const reg = /[^'"\\]+/g;
  var CompanynameReg = Companyname.replace(reg, Companyname);
  var Address1Reg = Address1.replace(reg, Address1);
  var AddressReg = Address.replace(reg, Address);
  var StateReg = State.replace(reg, State);
  var DistrictReg = District.replace(reg, District);

  let updateQuery = `UPDATE billing.companyprofileinfo SET Companyname = '${CompanynameReg}',Address1 = '${Address1Reg}',
  Address = '${AddressReg}',Pincode = '${Pincode}',State = '${StateReg}',District = '${DistrictReg}',Createdby = '${createdBy}'`;
  // Check if CompanyPhoto is not empty, then include it in the update query
  if (CompanyPhoto !== undefined && CompanyPhoto !== null && CompanyPhoto !== '') {
    updateQuery += `, CompanyPhoto = '${CompanyPhoto}'`;
  }

  updateQuery += ` WHERE Compinfoid = ${id}`;

  db.query(updateQuery, (err, result) => {
    if (err) {
      const errorMessage = `Error inserting data: ${err}`;
      console.log(errorMessage);
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            res.send(error)
          } else {
            res.send(Result)
          }
        }
      );
      res.status(500).send('Error updating data');
    } else {
      console.log(result);
      res.send(result);
    }
  });
})

// Delete Query

server.delete('/delete_companymaster', (req, res) => {
  const id = req.body.id
  const createdBy = req.body.createdBy
  const value = "InActive"
  db.query(`UPDATE billing.companymaster SET Status = '${value}' , createdby = '${createdBy}'  where companyid = ${id}`, (err, response) => {
    if (err) {
      const errorMessage = `Error delete data from delete_companymaster: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            console.error(error);
          }
        }
      );
      res.status(500).send('Error delete data');
    }
    else {
      console.log(response);
      res.send(response)
    }
  })
})
server.delete('/delete_branchmaster', (req, res) => {
  const id = req.body.id
  const createdBy = req.body.createdBy
  const value = "InActive"
  db.query(`UPDATE billing.branchmaster SET Status = '${value}' , createdby = '${createdBy}' where branchid = ${id}`, (err, response) => {
    if (err) {
      const errorMessage = `Error delete data from delete_branchmaster: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            console.error(error);
          }
        }
      );
      res.status(500).send('Error delete data');
    }
    else {
      console.log(response);
      res.send(response)
    }
  })
})



server.delete('/delete_products', (req, res) => {
  const id = req.body.id
  const createdBy = req.body.createdBy
  const value = "InActive"
  db.query(`UPDATE billing.product_master SET Status = '${value}' , createdby = '${createdBy}' where productid = ${id}`, (err, response) => {
    if (err) {
      const errorMessage = `Error delete data from delete_branchmaster: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            console.error(error);
          }
        }
      );
      res.status(500).send('Error delete data');
    }
    else {
      console.log(response);
      res.send(response)
    }
  })
})

server.delete('/delete_suppliers', (req, res) => {
  const id = req.body.id
  const createdBy = req.body.createdBy
  const value = "InActive"
  db.query(`UPDATE billing.suppliermaster SET Status = '${value}' , createdby = '${createdBy}' where Supplierid = ${id}`, (err, response) => {
    if (err) {
      const errorMessage = `Error delete data from delete_branchmaster: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            console.error(error);
          }
        }
      );
      res.status(500).send('Error delete data');
    }
    else {
      console.log(response);
      res.send(response)
    }
  })
})

server.delete('/delete_customers', (req, res) => {
  const id = req.body.id
  const createdBy = req.body.createdBy
  const value = "InActive"
  db.query(`UPDATE billing.Customer_Matser SET Status = '${value}' , createdby = '${createdBy}' where Customerid = ${id}`, (err, response) => {
    if (err) {
      const errorMessage = `Error delete data from delete_branchmaster: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.dbo.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            console.error(error);
          }
        }
      );
      res.status(500).send('Error delete data');
    }
    else {
      console.log(response);
      res.send(response)
    }
  })
})

server.delete('/delete_companyprofile', (req, res) => {
  const id = req.body.id
  const value = "i"
  db.query(`UPDATE billing.companyprofileinfo SET delstatus = '${value}' where Compinfoid = ${id}`, (err, response) => {
    if (err) {
      const errorMessage = `Error delete data from delete_Companyprofile: ${err}`;
      const currentDate = new Date().toLocaleString();
      const logData = `${errorMessage}\n`;
      const date = `${currentDate}`
      db.query(
        `INSERT INTO billing.err_log(error_logs, date) VALUES ('${logData}', '${date}')`,
        (error, Result) => {
          if (error) {
            console.error(error);
          }
        }
      );
      res.status(500).send('Error delete data');
    }
    else {
      console.log(response);
      res.send(response)
    }
  })
})

// Edit Query

server.get('/editcompany_data/:id', (req, res) => {
  const id = req.params.id
  db.query(`SELECT * FROM billing.companymaster where companyid  = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});

server.get('/editbranch_data/:id', (req, res) => {
  const id = req.params.id
  db.query(`SELECT * FROM billing.branchmaster where branchid = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});

server.get('/editproduct_data/:id', (req, res) => {
  const id = req.params.id
  db.query(`SELECT * FROM billing.product_master where productid = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});

server.get('/editsupplier_data/:id', (req, res) => {
  const id = req.params.id
  db.query(`SELECT * FROM billing.suppliermaster where Supplierid  = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});

server.get('/editCustomer_data/:id', (req, res) => {
  const id = req.params.id
  db.query(`SELECT * FROM billing.Customer_Matser where Customerid  = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});

server.get('/editcompanyprofile_data/:id', (req, res) => {
  const id = req.params.id
  db.query(`SELECT * FROM billing.companyprofileinfo where Compinfoid  = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});

// DropDown Quers

server.get('/drop-down', (req, res) => {
  db.query('SELECT * FROM billing.companymaster', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});

server.get('/drop-down-branch', (req, res) => {
  db.query('SELECT * FROM billing.branchmaster', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});


server.get('/drop-down-product_master', (req, res) => {
  const status = 'Active'
  db.query(`SELECT productid,productname FROM billing.product_master 
  where status = '${status}'`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});

server.get('/drop-down-suppliermaster', (req, res) => {
  const status = 'Active'
  db.query(`SELECT row_number()over(order by productid desc)Sno, Suppliername FROM billing.suppliermaster where status = '${status}'`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});

server.get('/drop-down-supplierdatas', (req, res) => {
  const status = 'Active'
  const value = req.query.SupplierName || '';
  db.query(`SELECT row_number()over(order by Supplierid desc)Sno,productid FROM billing.suppliermaster where Suppliername = '${value}' and status = '${status}'`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});


server.get('/drop-down-supplierquantity', (req, res) => {
  const { quantity, suppliername } = req.query;
  db.query(`SELECT row_number() over (order by Supplierid desc) Sno, Qtykg,Amount FROM billing.suppliermaster WHERE Suppliername = '${suppliername}' AND productid = '${quantity}'`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      console.log(result);
      res.send(result);
    }
  });
});


server.get('/drop-down-Customername', (req, res) => {
  db.query('SELECT row_number()over(order by Customerid desc)Sno, CustomerName FROM billing.Customer_Matser', (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      console.log('success');
      res.send(result);
    }
  });
});






server.listen(PORT, () => {
  console.log(`Server is connected ${PORT}`);
});


