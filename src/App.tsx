import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./index.css";

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

interface Attendee {
  attendeeAddress: string;
  name: string;
  idNumber: number;
}

const contractAddress = "0xc71e7CE1A97684497d0C63AcBbaB144F1aDD3FCd";
const contractABI = [
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "attendees",
    outputs: [
      { internalType: "address", name: "attendeeAddress", type: "address" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "idNumber", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAttendees",
    outputs: [
      {
        components: [
          { internalType: "address", name: "attendeeAddress", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "uint256", name: "idNumber", type: "uint256" },
        ],
        internalType: "struct Attendance.Attendee[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "uint256", name: "_idNumber", type: "uint256" },
    ],
    name: "registerAttendance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const Another: React.FC = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [name, setName] = useState<string>("");
  const [idNumber, setIdNumber] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
        const signer = await newProvider.getSigner();
        const attendanceContract = new ethers.Contract(contractAddress, contractABI, signer);
        setProvider(newProvider);
        setContract(attendanceContract);
        setIsConnected(true);
        fetchAttendees();
        alert("Wallet connected and contract initialized!");
      } catch (error) {
        console.error("Connection failed:", error);
        alert("Connection failed, please try again.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const registerAttendance = async () => {
    if (contract && name && idNumber) {
      const idNum = parseInt(idNumber);
      if (isNaN(idNum)) {
        alert("ID Number must be a valid number.");
        return;
      }

      try {
        const tx = await contract.registerAttendance(name, idNum);
        await tx.wait();
        fetchAttendees();
        setName(""); 
        setIdNumber("");
      } catch (error) {
        console.error("Registration failed:", error);
        alert("Registration failed, please try again.");
      }
    } else {
      alert("Please enter both name and ID number.");
    }
  };

  const fetchAttendees = async () => {
    if (contract) {
      try {
        const result = await contract.getAttendees();
        setAttendees(result.map((attendee: [string, number, string]) => ({
          attendeeAddress: attendee[0],
          name: attendee[1],
          idNumber: attendee[2]
        })));
      } catch (error) {
        console.error("Failed to fetch attendees:", error);
        alert("Failed to fetch attendees.");
      }
    }
  };

  useEffect(() => {
    fetchAttendees()
  }, [fetchAttendees]);


  return (
    <div className="App">
      <nav className="flex w-full items-center justify-between bg-[#111111] py-2 shadow-md dark:bg-neutral-700 lg:py-4">
        <div className="flex items-center justify-between w-full px-4 md:px-10 mx-auto">
          <div>
            <a className="flex items-center" href="../App.tsx">
              <span className="text-xl font-semibold text-white">ONCHAIN ATTENDANCE</span>
            </a>
          </div>

          <div className="ml-auto">
            <button
              className="inline-block font-bold rounded bg-white px-4 py-2 text-[#111111] transition duration-150 ease-in-out hover:bg-[#111111] hover:text-white hover:border focus:outline-none focus:ring-2 focus:ring-[#111111]"
              onClick={connectWallet}
            >
              {isConnected ? "Connected" : "Connect Wallet"}
            </button>
          </div>
        </div>
      </nav>
      <div className="flex items-center justify-center h-screen bg-white text-[#111111]">
        <div className="text-center px-4 md:px-0">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Welcome to Our Amazing dApp!
          </h2>
          <button
            className="bg-[#111111] text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-white border hover:text-[#111111] transition duration-300 mt-10"
            onClick={connectWallet}
          >
            {isConnected ? "Connected" : "Connect Wallet"}
          </button>
        </div>
      </div>
      <div className="bg-[#111111] text-white py-[150px] px-10 w-full shadow-md mb-10">
        <h2 className="text-center text-3xl md:text-5xl font-bold mb-10">Register Attendance</h2>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
        />
        <input
          type="text"
          placeholder="Enter ID Number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
        />
        <button
          className="w-full bg-white text-black py-2 rounded hover:bg-gray-300 font-semibold"
          onClick={registerAttendance}
        >
          Register
        </button>
      </div>

      <h2 className="text-3xl md:text-5xl font-bold mb-10 mt-40 text-center">Attendees List</h2>
      <div className="overflow-x-auto w-11/12 md:w-2/3 lg:w-4/5 mx-auto mt-[20px] mb-20">
        <table className="table-auto w-full border-collapse border border-gray-700 text-white">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-4 py-2 border border-gray-700">Name</th>
              <th className="px-4 py-2 border border-gray-700">ID No</th>
              <th className="px-4 py-2 border border-gray-700">Address</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((attendee, index) => (
              <tr key={index} className="text-center odd:bg-gray-900 even:bg-gray-800">
                <td className="px-4 py-2 border border-gray-700">{attendee.name}</td>
                <td className="px-4 py-2 border border-gray-700">{attendee.idNumber}</td>
                <td className="px-4 py-2 border border-gray-700">{attendee.attendeeAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Another;