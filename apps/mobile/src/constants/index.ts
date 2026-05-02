import arrowBack from '@assets/icons/arrow-back.png';
import arrowDown from '@assets/icons/arrow-down.png';
import arrowRight from '@assets/icons/arrow-right.png';
import bag from '@assets/icons/bag.png';
import check from '@assets/icons/check.png';
import clock from '@assets/icons/clock.png';
import dollar from '@assets/icons/dollar.png';
import envelope from '@assets/icons/envelope.png';
import home from '@assets/icons/home.png';
import location from '@assets/icons/location.png';
import logout from '@assets/icons/logout.png';
import minus from '@assets/icons/minus.png';
import pencil from '@assets/icons/pencil.png';
import person from '@assets/icons/person.png';
import phone from '@assets/icons/phone.png';
import plus from '@assets/icons/plus.png';
import search from '@assets/icons/search.png';
import star from '@assets/icons/star.png';
import trash from '@assets/icons/trash.png';
import user from '@assets/icons/user.png';

import avatar from '@assets/images/anil.jpg';
import avocado from '@assets/images/avocado.png';
import burgerOne from '@assets/images/burger-one.png';
import burgerTwo from '@assets/images/burger-two.png';
import buritto from '@assets/images/buritto.png';
import cheese from '@assets/images/cheese.png';
import coleslaw from '@assets/images/coleslaw.png';
import emptyState from '@assets/images/empty-state.png';
import fries from '@assets/images/fries.png';
import loginGraphic from '@assets/images/login-graphic.png';
import logo from '@assets/images/logo.png';
import mushrooms from '@assets/images/mushrooms.png';
import onions from '@assets/images/onions.png';
import pickles from '@assets/images/pickles.png';
import pizzaOne from '@assets/images/pizza-one.png';
import pringles from '@assets/images/pringles.png';
import mozz from '@assets/images/mozz.png';
import bacons from '@assets/images/bacons.png';
import salad from '@assets/images/salad.png';
import success from '@assets/images/success.png';
import tomatoes from '@assets/images/tomatoes.png';

import type { ImageSourcePropType } from 'react-native';

export const OPTION_IMAGE_MAP: Record<string, ImageSourcePropType> = {
  Tomato: tomatoes,
  Onions: onions,
  Cheese: cheese,
  Bacon: bacons,
  Pickles: pickles,
  Mushroom: mushrooms,
  Avocado: avocado,
  Fries: fries,
  Coleslaw: coleslaw,
  Salad: salad,
  Pringles: pringles,
  Mozz: mozz,
};

export const CATEGORIES = [
  { id: '1', name: 'All' },
  { id: '2', name: 'Burger' },
  { id: '3', name: 'Pizza' },
  { id: '4', name: 'Wrap' },
  { id: '5', name: 'Burrito' },
];

export const offers = [
  { id: 1, title: 'SUMMER COMBO', image: burgerOne, color: '#D33B0D' },
  { id: 2, title: 'BURGER BASH', image: burgerTwo, color: '#DF5A0C' },
  { id: 3, title: 'PIZZA PARTY', image: pizzaOne, color: '#084137' },
  { id: 4, title: 'BURRITO DELIGHT', image: buritto, color: '#EB920C' },
];

export const sides = [
  { name: 'Fries', image: fries, price: 3.5 },
  { name: 'Onion Rings', image: onions, price: 4.0 },
  { name: 'Mozarella Sticks', image: mozz, price: 5.0 },
  { name: 'Coleslaw', image: coleslaw, price: 2.5 },
  { name: 'Salad', image: salad, price: 4.5 },
];

export const toppings = [
  { name: 'Avocado', image: avocado, price: 1.5 },
  { name: 'Bacon', image: bacons, price: 2.0 },
  { name: 'Cheese', image: cheese, price: 1.0 },
  { name: 'Pickles', image: pickles, price: 0.5 },
  { name: 'Mushrooms', image: mushrooms, price: 1.2 },
  { name: 'Onions', image: onions, price: 0.5 },
  { name: 'Tomatoes', image: tomatoes, price: 0.7 },
];

export const images = {
  avatar,
  avocado,
  bacons,
  burgerOne,
  burgerTwo,
  buritto,
  cheese,
  coleslaw,
  emptyState,
  fries,
  loginGraphic,
  logo,
  mozz,
  mushrooms,
  onions,
  pickles,
  pizzaOne,
  pringles,
  salad,
  success,
  tomatoes,
  arrowBack,
  arrowDown,
  arrowRight,
  bag,
  check,
  clock,
  dollar,
  envelope,
  home,
  location,
  logout,
  minus,
  pencil,
  person,
  phone,
  plus,
  search,
  star,
  trash,
  user,
};
