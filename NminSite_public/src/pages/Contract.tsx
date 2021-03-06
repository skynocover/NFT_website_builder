import React from "react";
import { Button, Box, Flex, Text, Image, Link, Spacer, Textarea } from "@chakra-ui/react";
import { AppContext } from "../AppContext";
import Swal from "sweetalert2";
import { ethers } from "ethers";

import NFToken from "../assets/contracts/NFToken.json";

import { useParams } from "react-router-dom";

import Facebook from "../assets/social-media-icons/facebook_32x32.png";
import Twitter from "../assets/social-media-icons/twitter_32x32.png";
import Email from "../assets/social-media-icons/email_32x32.png";

interface website {
  addr: string;
  content: string;
  coverURL: string;
  title: string;
}

interface NFT {
  name: string;
  symbol: string;
}

export default function Contract() {
  const appCtx = React.useContext(AppContext);

  const [setting, setSetting] = React.useState<website>();
  const [nft, setNft] = React.useState<NFT>();
  const [bg, setBG] = React.useState<string>("");

  const [NFTcontract, setNFTcontract] = React.useState<ethers.Contract>();

  const { tokenId } = useParams();

  if (!tokenId || isNaN(+tokenId)) {
    return <>404</>;
  }

  const mint = async () => {
    if (appCtx.signer) {
      const tx = await NFTcontract?.connect(appCtx.signer).mint();
      const response = await tx.wait();

      const { events } = response;
      events.map((event: any) => {
        if (event.event === "Transfer") {
          const { tokenId } = event.args;
          Swal.fire("Mint Success", "you get token " + tokenId, "success");
        }
      });
    }
  };

  const init = async () => {
    try {
      if (appCtx.contract && appCtx.signer && appCtx.provider) {
        const response = await appCtx.contract.connect(appCtx.signer).websites(+tokenId);
        console.log(response);

        const { addr, content, coverURL, title } = response;

        setSetting({ addr, content, coverURL, title });
        setBG(`url("${coverURL}")`);

        const NFTcontract = new ethers.Contract(addr, NFToken.abi, appCtx.provider);
        setNFTcontract(NFTcontract);

        const name = await NFTcontract.connect(appCtx.signer).name();

        const symbol = await NFTcontract.connect(appCtx.signer).symbol();
        setNft({ name, symbol });
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  React.useEffect(() => {
    init();
  }, [appCtx.contract]);

  return (
    <>
      <div className="App">
        <Flex justify="space-between" align="center" padding="30px">
          <Flex justify="space-between" width="40%" padding="0 75px">
            <Link href="http://www.facebook.com">
              <Image src={Facebook} boxSize="42px" margin="0 15px" />
            </Link>

            <Link href="http://www.twitter.com">
              <Image src={Twitter} boxSize="42px" margin="0 15px" />
            </Link>

            <Link href="http://www.gmail.com">
              <Image src={Email} boxSize="42px" margin="0 15px" />
            </Link>
          </Flex>

          <Flex justify="space-around" align="center" width="40%" padding="30px">
            <Box margin="0 15px">About</Box>
            <Spacer />
            <Box margin="0 15px">Mint</Box>
            <Spacer />
            <Box margin="0 15px">Team</Box>
            <Spacer />

            {appCtx.contract ? (
              <Box margin="0 15px">Connected</Box>
            ) : (
              <Button
                backgroundColor="#D6517D"
                borderRadius="5px"
                boxShadow="0px 2px 2px 1px #0F0F0F"
                color="white"
                cursor="pointer"
                fontFamily="inherit"
                padding="15px"
                margin="0 15px"
                onClick={() => {
                  appCtx.connect();
                }}
              >
                Connect
              </Button>
            )}
          </Flex>
        </Flex>
        <Flex justify="center" align="center" height="100vh" paddingBottom="150px">
          <Box width="520px">
            <div>
              <Text fontSize="48px" textShadow="0 5px #000000">
                {setting?.title}
              </Text>
              <Textarea
                value={setting?.content}
                readOnly
                rows={8}
                fontSize="30px"
                letterSpacing="-5.5%"
                fontFamily="VT323"
                textShadow="0 2px 2px #000000"
                borderWidth={0}
                resize="none"
              />
            </div>
          </Box>
          {appCtx.contract ? (
            <Flex>
              <Button
                backgroundColor="#D6517D"
                borderRadius="5px"
                boxShadow="0px 2px 2px 1px #0F0F0F"
                color="white"
                cursor="pointer"
                fontFamily="inherit"
                padding="15px"
                margin="10px"
                onClick={mint}
              >
                get {nft?.symbol}
              </Button>
            </Flex>
          ) : (
            <p>connected first</p>
          )}
        </Flex>
      </div>
      <div className="moving-background" style={{ backgroundImage: bg }}></div>
    </>
  );
}
