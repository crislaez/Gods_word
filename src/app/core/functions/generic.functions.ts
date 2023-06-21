import { IonContent } from "@ionic/angular";
// import { SwiperOptions } from './../../../../node_modules/swiper/types/swiper-options.d';
// import { Card } from "@pokemonTcg/features/card";

export const trackById = (_: number, item: any): number => {
  return item?.id ?? item;
}

export const gotToTop = (content: IonContent): void => {
  content?.scrollToTop(500);
}

export const isNotEmptyObject = (object: any): boolean => {
  return Object.keys(object || {})?.length > 0
}

export const getObjectKeys = <T>(obj: T): string[] => {
  return Object.keys(obj || {})
}

export const sliceText = (text: string, slice: number = 20): string => {
  return text?.length > slice ? text?.slice(0, slice) + '...' : text;
}

export const errorImage = (event: any): void => {
  event.target.src = 'assets/images/image_not_found.png';
}

export const skeletonLength = (length: number = 18) => {
  return new Array(length)?.fill(0)?.map((_,index) => index + 1)
}

export const filterNoRepeatItem = <T>(list: T[], checkField: string): T[] => {
  let obj: any = {};

  return (list || [])?.filter(item => {
    const value = (item as any)?.[checkField];
    if(!obj[value]){
      obj[value] = true
      return true
    }
    return false
  })
}

export const objectEntries = <T>(obj: T): any => {
  return Object.entries(obj || {})
}

export const filterItem = <T>(search: string, searchField: string, list:T[]): T[] => {
  return !search
         ? list
         : (list || [])?.filter(item => (item as any)?.[searchField]?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase()))
}

export const numberDay = (): number => {
    const now = new Date()
    return now.getDate()
}

// export const getSliderConfig = (slidesPerView: number = 1): SwiperOptions => {
//   return {
//     slidesPerView,
//     spaceBetween: 10,
//     pagination:{ clickable: true },
//   };
// }

// export const orderItemByDateDesc = (list: any[], field: string): any[] => {
//   return [...(list || [])]?.sort((a, b) => {
//     const firstItemDate = new Date(a?.[field]);
//     const secondItemDate = new Date(b?.[field]);

//     if(firstItemDate < secondItemDate) return 1;
//     if(firstItemDate > secondItemDate) return -1;
//     return 0;
//   })
// }

// export const orderItemByDateAsc = <T>(list: T[], field: string): T[] => {
//   return [...(list || [])]?.sort((a, b) => {
//     const firstItemDate = new Date((a as any)?.[field]);
//     const secondItemDate = new Date((b as any)?.[field]);

//     if(firstItemDate > secondItemDate) return 1;
//     if(firstItemDate < secondItemDate) return -1;
//     return 0;
//   })
// }

// export const orderItemAsc = <T>(list:T[], field: string): T[] => {
//   return [...(list || [])]?.sort((a, b) => {
//     const fieldA = (a as any)?.[field] || '';
//     const fieldB = (b as any)?.[field] || '';
//     if(fieldA > fieldB) return 1;
//     if(fieldA < fieldB) return -1;
//     return 0
//   })
// }

// export const orderItemDesc = <T>(list:T[], field: string): T[] => {
//   return [...(list || [])]?.sort((a, b) => {
//     const fieldA = (a as any)?.[field] || '';
//     const fieldB = (b as any)?.[field] || '';
//     if(fieldA < fieldB) return 1;
//     if(fieldA > fieldB) return -1;
//     return 0
//   })
// }

// export const noRepeatListItem = <T>(list: T[], field: string): T[] => {
//   const obj: { [key: string]: boolean } = {};

//   return (list || [])?.filter((item: any) => {
//     const key = item?.[field] ||  null;
//     if(!obj?.[key]){
//       obj[key] = true;
//       return true
//     }
//     return false;
//   });
// }

// export const getFistTypeCard = (card: Card): string => {
//   const { types } = card || {};
//   const [ firstType ] = types || [];
//   return firstType || '';
// }

// export const objectToEntries = <T>(list:T) => {
//   return Object.entries(list || {})
// }
