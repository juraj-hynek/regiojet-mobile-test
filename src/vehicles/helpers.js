// @flow
import { type IconType } from '../components/Icon';

const serviceMap: { [key: string]: IconType } = {
  typy_vozidel_dotykova_obrazovka: 'touchScreen',
  typy_vozidel_sluchatka: 'headphones',
  typy_vozidel_wifi_ano: 'wifi',
  typy_vozidel_denni_tisk: 'newspaper',
  typy_vozidel_teple_napoje_zdarma: 'drinksHot',
  typy_vozidel_stevardka: 'steward',
  typy_vozidel_zabavni_portal_ano: 'funPortal',
  typy_vozidel_detske_kupe: 'kids',
  typy_vozidel_chlazene_napoje: 'drinksCold',
  typy_vozidel_obcerstveni: 'food',
  typy_vozidel_klimatizace: 'airCondition',
  typy_vozidel_zasuvka: 'plug',
  typy_vozidel_bez_dotykove_obrazovky: 'touchScreenNo',
  typy_vozidel_preprava_kola: 'bike',
  typy_vozidel_spaci_vuz: 'bed',
  typy_vozidel_spaci_vuz_zeny: 'bedWomen',
  typy_vozidel_low_cost: 'lowCost',
  typy_vozidel_tiche_kupe: 'silence',
  typy_vozidel_imobilni_rampa: 'wheelChair',
  typy_vozidel_wifi_ne: 'wifiNo',
};

export const getServiceIconNameByType = (type: string): IconType => serviceMap[type];
