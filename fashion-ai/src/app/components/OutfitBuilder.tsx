// // /components/OutfitBuilder.tsx
// "use client";

// import { useState } from "react";
// import { CategorizedResults, OutfitSuggestion,  } from "../lib/types";

// interface OutfitBuilderProps {
//   outfitSuggestions: OutfitSuggestion[];
// }

// export default function OutfitBuilder({ 
//   outfitSuggestions 
// }: OutfitBuilderProps) {
  
//   const [selectedOutfit, setSelectedOutfit] = useState<number>(0);
  

//   const formatPrice = (item: CategorizedItem) => {
//     if (!item.price?.value) return "Price not available";
//     const currency = (item.price.currency === 'USD') ? 'USD': item.price.currency;
//     return `${currency}${item.price.value}`;
//   };

//   const handleItemClick = (item: CategorizedItem) => {
//     if (item.itemWebUrl) {
//       window.open(item.itemWebUrl, '_blank');
//     }
//   };

//   if (!outfitSuggestions.length) {
//     return null;
//   }

//   return (
//     <div className="outfit-builder">
//       {/* Outfit Suggestions */}
//       <section className="outfits-section">
//         <h2>Outfit Suggestions</h2>
//         <p className="outfits-description">
//           Based on your inspiration image, here are some complete outfit ideas:
//         </p>
        
//         {/* Outfit Tabs */}
//         <div className="outfit-tabs">
//           {outfitSuggestions.map((outfit, index) => (
//             <button
//               key={index}
//               className={`outfit-tab ${selectedOutfit === index ? 'active' : ''}`}
//               onClick={() => setSelectedOutfit(index)}
//             >
//               <span className="outfit-tab-name">{outfit.name}</span>
//               {outfit.totalPrice && (
//                 <span className="outfit-price">
//                   ${outfit.totalPrice.toFixed(2)}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Selected Outfit Display */}
//         {outfitSuggestions[selectedOutfit] && (
//           <div className="selected-outfit">
//             <div className="outfit-header">
//               <h3>{outfitSuggestions[selectedOutfit].name}</h3>
//               <p className="outfit-description">
//                 {outfitSuggestions[selectedOutfit].description}
//               </p>
//               {outfitSuggestions[selectedOutfit].totalPrice && (
//                 <div className="total-price">
//                   Total: ${outfitSuggestions[selectedOutfit].totalPrice?.toFixed(2)}
//                 </div>
//               )}
//             </div>

//             <div className="outfit-items">
//               {outfitSuggestions[selectedOutfit].items.map((item, index) => (
//                 <div 
//                   key={index} 
//                   className="outfit-item"
//                   onClick={() => handleItemClick(item)}
//                   style={{ cursor: item.itemWebUrl ? 'pointer' : 'default' }}
//                 >
//                   <div className="outfit-item-image">
//                     <img 
//                       src={item.image?.imageUrl || "/placeholder.png"} 
//                       alt={item.title}
//                     />
//                     <div className="item-category-badge">
//                       {item.category}
//                     </div>
//                     {item.itemWebUrl && (
//                       <div className="click-indicator">
//                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                           <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
//                           <polyline points="15,3 21,3 21,9"/>
//                           <line x1="10" y1="14" x2="21" y2="3"/>
//                         </svg>
//                       </div>
//                     )}
//                   </div>
//                   <div className="outfit-item-details">
//                     <h4>{item.title}</h4>
//                     <p className="price">{formatPrice(item)}</p>
//                     {item.clipSimilarity && (
//                       <p className="similarity">
//                         {(item.clipSimilarity * 100).toFixed(0)}% match
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="outfit-actions">
//               <button className="save-outfit-btn">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
//                   <polyline points="17,21 17,13 7,13 7,21"/>
//                   <polyline points="7,3 7,8 15,8"/>
//                 </svg>
//                 Save Outfit
//               </button>
//               <button className="share-outfit-btn">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <circle cx="18" cy="5" r="3"/>
//                   <circle cx="6" cy="12" r="3"/>
//                   <circle cx="18" cy="19" r="3"/>
//                   <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
//                   <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
//                 </svg>
//                 Share Outfit
//               </button>
//             </div>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }