import UK from '../images/countryFlag/UK.gif';
import BE from '../images/countryFlag/BE.gif';
import HR from '../images/countryFlag/HR.gif';
import CZ from '../images/countryFlag/CZ.gif';
import DK from '../images/countryFlag/DK.gif';
import FR from '../images/countryFlag/FR.gif';
import NL from '../images/countryFlag/NL.gif';
import LU from '../images/countryFlag/LU.gif';
import HU from '../images/countryFlag/HU.gif';
import DE from '../images/countryFlag/DE.gif';
import NO from '../images/countryFlag/NO.gif';
import PL from '../images/countryFlag/PL.gif';
import AT from '../images/countryFlag/AT.gif';
import RO from '../images/countryFlag/RO.gif';
import CH from '../images/countryFlag/CH.gif';
import SE from '../images/countryFlag/SE.gif';
import SK from '../images/countryFlag/SK.gif';
import IT from '../images/countryFlag/IT.gif';
import BY from '../images/countryFlag/BY.gif';
import LT from '../images/countryFlag/LT.gif';
import LV from '../images/countryFlag/LV.gif';
import MK from '../images/countryFlag/MK.gif';
import MD from '../images/countryFlag/MD.gif';
import GR from '../images/countryFlag/GR.gif';
import RS from '../images/countryFlag/RS.gif';
import ES from '../images/countryFlag/ES.gif';
import UA from '../images/countryFlag/UA.gif';

const imgMap = {
  UK,
  BE,
  HR,
  CZ,
  DK,
  FR,
  NL,
  IT,
  LU,
  HU,
  DE,
  NO,
  PL,
  AT,
  RO,
  SK,
  SE,
  CH,
  BY,
  LT,
  LV,
  MK,
  MD,
  GR,
  RS,
  ES,
  UA,
};

const getImage = code => {
  const imgSource = imgMap[code];

  if (!imgSource) {
    throw new Error(`Image name "${code}" not supported`);
  }
  return imgSource;
};

export default getImage;
