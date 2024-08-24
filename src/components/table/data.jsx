import React,{useState,useEffect} from 'react';
import { MDBContainer, MDBRow, MDBCol } from "mdbreact";
import './index.css';

const gridExamplesPage = () => {
    return (
      <MDBContainer>
        <MDBRow>
          <MDBCol>One of three columns</MDBCol>
          <MDBCol>One of three columns</MDBCol>
          <MDBCol>One of three columns</MDBCol>
        </MDBRow>
      </MDBContainer>
    );
  }
  
export default gridExamplesPage;