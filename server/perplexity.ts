// Plant care information database
const plantCareDatabase = {
  default: {
    content: `
# General Plant Care Guide

## Watering
- Most houseplants prefer to dry out slightly between waterings
- Check the top 1-2 inches of soil; water when dry
- Reduce watering in winter, increase in summer
- Use room temperature water to avoid shocking roots

## Light
- Most houseplants prefer bright, indirect light
- Avoid direct sunlight which can scorch leaves
- Rotate plants regularly to ensure even growth
- Signs of insufficient light: leggy growth, small leaves
- Signs of too much light: scorched leaves, dry soil

## Soil & Fertilizing
- Use well-draining potting mix appropriate for your plant type
- Fertilize during growing season (spring-summer) only
- Dilute fertilizer to half-strength to prevent burning
- Repot when plant becomes root-bound (usually every 1-2 years)

## Common Issues
- Yellow leaves: Usually indicates overwatering
- Brown leaf tips: Often due to dry air or mineral buildup
- Pests: Check regularly for spider mites, mealybugs, and scale
- Root rot: Caused by overwatering, repot in fresh soil if caught early

## Seasonal Care
- Reduce watering and stop fertilizing in winter
- Increase humidity around plants in winter if using indoor heating
- Clean leaves regularly to remove dust and help plants photosynthesize
- Use a humidifier or pebble tray for tropical plants
`,
    tags: ["watering", "light", "fertilizing", "seasonal care", "pests"]
  },
  
  // Common houseplants
  "monstera": {
    content: `
# Monstera Deliciosa Care Guide

## Watering
- Allow the top 2-3 inches of soil to dry out between waterings
- Water thoroughly until water flows from drainage holes
- Reduce watering in winter when growth slows
- Water approximately once every 1-2 weeks, adjusting based on conditions

## Light
- Thrives in medium to bright indirect light
- Can tolerate some direct morning sunlight
- Avoid harsh afternoon sun which can burn leaves
- Fenestration (leaf holes) will not develop properly in low light

## Soil & Fertilizing
- Use a well-draining, chunky aroid mix
- Mix in perlite, orchid bark, and charcoal for better drainage
- Fertilize monthly during growing season (spring-summer) with balanced liquid fertilizer
- Do not fertilize in winter when growth is minimal

## Common Issues
- Yellow leaves: Usually indicates overwatering
- Brown leaf edges: Low humidity or inconsistent watering
- Lack of fenestration: Insufficient light or immature plant
- Pests: Check for spider mites and scale, especially under leaves

## Pruning & Support
- Provide a moss pole or trellis for climbing as the plant matures
- Prune to control size and remove damaged leaves
- Can be propagated easily from stem cuttings with nodes

## Humidity & Temperature
- Prefers humidity levels of 60% or higher
- Use a humidifier or pebble tray to increase humidity
- Keep away from cold drafts and maintain temperatures between 65-85°F
`,
    tags: ["watering", "light", "humidity", "propagation", "fertilizing"]
  },
  
  "pothos": {
    content: `
# Pothos (Epipremnum aureum) Care Guide

## Watering
- Allow soil to dry out halfway before watering
- Very tolerant of inconsistent watering
- More susceptible to overwatering than underwatering
- Water approximately every 1-2 weeks

## Light
- Adaptable to various light conditions
- Grows best in medium to bright indirect light
- Can tolerate low light but growth will be slower
- Variegated varieties need brighter light to maintain patterns

## Soil & Fertilizing
- Use a standard well-draining potting mix
- Fertilize lightly every 2-3 months during growing season
- No need to fertilize in winter
- Repot every 2-3 years or when root-bound

## Common Issues
- Yellow leaves: Typically overwatering
- Brown spots: Often sunburn or cold damage
- Leggy growth: Insufficient light
- Very resilient to pests but occasionally gets mealybugs

## Propagation
- Extremely easy to propagate from stem cuttings
- Can root in water or directly in soil
- Each cutting should have at least one node
- Root development takes 2-4 weeks in water

## Special Notes
- Perfect for beginners due to high tolerance for neglect
- Effective air purifier for indoor spaces
- Toxic to pets if ingested
- Can be trained to climb or trail from hanging baskets
`,
    tags: ["watering", "light", "propagation", "beginner-friendly", "air-purifying"]
  },
  
  "snake plant": {
    content: `
# Snake Plant (Sansevieria) Care Guide

## Watering
- Very drought tolerant - water only when soil is completely dry
- Water approximately once every 3-6 weeks
- Reduce watering further in winter
- Root rot from overwatering is the most common issue

## Light
- Extremely adaptable to different light conditions
- Can survive in low light but grows best in medium to bright indirect light
- Can tolerate some direct sunlight once acclimated
- Variegated varieties need more light to maintain patterns

## Soil & Fertilizing
- Use well-draining cactus or succulent mix
- Add extra perlite or sand for better drainage
- Fertilize only 2-3 times per year during growing season
- Use half-strength balanced fertilizer

## Common Issues
- Soft, mushy base: Overwatering leading to rot
- Brown tips: Occasionally from fluoride in tap water
- Wrinkled leaves: Underwatering (rare)
- Rarely affected by pests, but can get spider mites in dry conditions

## Special Features
- Excellent air purifier, removes toxins and releases oxygen at night
- Extremely low maintenance
- Can be divided when root-bound to create new plants
- Long-lived when properly cared for

## Growth Patterns
- Slow-growing but can live for decades
- New leaves emerge from the soil as pointed spears
- Can occasionally produce small, fragrant flowers on mature plants
`,
    tags: ["drought-tolerant", "low-maintenance", "air-purifying", "watering", "light"]
  },
  
  "fiddle leaf fig": {
    content: `
# Fiddle Leaf Fig (Ficus lyrata) Care Guide

## Watering
- Allow top 2 inches of soil to dry between waterings
- Water thoroughly until it drains from bottom
- Consistent watering schedule is important
- Reduce watering in winter months
- Approximately once every 7-10 days during growing season

## Light
- Requires bright, indirect light
- Can tolerate a few hours of direct morning sun
- Rotate regularly for even growth
- Keep away from hot, direct afternoon sun which can scorch leaves

## Soil & Fertilizing
- Use well-draining, high-quality potting mix
- Add orchid bark or perlite to improve drainage
- Fertilize monthly during growing season (spring-summer)
- Use balanced liquid fertilizer diluted to half strength

## Common Issues
- Brown spots: Usually from overwatering or inconsistent watering
- Leaf drop: Often due to stress from environmental changes
- Yellowing leaves: Typically from overwatering
- Susceptible to root rot if overwatered

## Humidity & Temperature
- Prefers moderate to high humidity (40-60%)
- Keep away from drafts, heaters, and air conditioners
- Maintain temperatures between c. 65-75°F
- Mist leaves occasionally or use a humidifier in dry environments

## Special Notes
- Dislikes being moved and may drop leaves when relocated
- Clean large leaves regularly with a damp cloth to remove dust
- Can grow quite tall (6+ feet) when happy
- New leaves emerge from the top in a reddish sheath
`,
    tags: ["watering", "light", "humidity", "temperamental", "leaf health"]
  },
  
  "peace lily": {
    content: `
# Peace Lily (Spathiphyllum) Care Guide

## Watering
- Keep soil consistently moist but not soggy
- Water when the top inch of soil feels dry
- Very communicative plant - leaves will droop when thirsty
- Use room temperature water to avoid shocking roots
- Water about once a week, adjusting based on conditions

## Light
- Thrives in medium to low indirect light
- Can tolerate fluorescent lighting, making it perfect for offices
- Too much direct sun will scorch leaves
- Insufficient light will reduce or prevent flowering

## Soil & Fertilizing
- Use rich, well-draining potting mix
- Add organic matter like coco coir for moisture retention
- Fertilize lightly every 6-8 weeks during growing season
- Use balanced houseplant fertilizer at half strength

## Flowers
- Produces distinctive white "flowers" (actually modified leaves called spathes)
- More likely to flower with proper care and sufficient light
- Flowers can last for weeks or months
- Remove spent flowers at the base when they turn green

## Humidity & Air Purification
- Prefers high humidity (50%+)
- Excellent air purifier - removes common household toxins
- Mist regularly or use a pebble tray to increase humidity
- Keep away from cold drafts

## Common Issues
- Brown leaf tips: Usually from tap water minerals or low humidity
- Yellow leaves: Typically from overwatering
- No flowers: Often due to insufficient light
- Very susceptible to spider mites in dry conditions

## Toxicity
- Contains calcium oxalate crystals
- Toxic to pets and humans if ingested
- Can cause irritation to mouth and digestive system
`,
    tags: ["watering", "humidity", "air-purifying", "flowering", "low-light"]
  },
  
  "zz plant": {
    content: `
# ZZ Plant (Zamioculcas zamiifolia) Care Guide

## Watering
- Extremely drought tolerant thanks to rhizomatous roots
- Allow soil to dry completely between waterings
- Water approximately once every 3-4 weeks
- Reduce further in winter to once every 6-8 weeks
- More likely to die from overwatering than underwatering

## Light
- Highly adaptable to various light conditions
- Grows well in low to bright indirect light
- Avoid direct sunlight which can burn leaves
- One of the best plants for low light conditions
- Growth will be slower in lower light

## Soil & Fertilizing
- Use well-draining potting mix
- Add extra perlite for better drainage
- Fertilize only 2-3 times per year during growing season
- Use balanced houseplant fertilizer at half strength

## Growth Habits
- Slow-growing but very long-lived
- New stems emerge directly from the soil
- Glossy, waxy leaves are naturally shiny without polish
- Can grow to 2-3 feet tall and wide when mature

## Special Features
- Nearly indestructible - perfect for beginners
- Can tolerate neglect for long periods
- Excellent air purifier
- Very rarely affected by pests or diseases

## Propagation
- Can be propagated from leaf cuttings (slow process)
- Division of rhizomes when repotting is more reliable
- Patience required as it's a slow grower

## Toxicity
- Contains calcium oxalate crystals
- Toxic to pets and humans if ingested
- Keep away from children and pets
`,
    tags: ["drought-tolerant", "low-maintenance", "low-light", "air-purifying", "watering"]
  },
  
  "aloe vera": {
    content: `
# Aloe Vera Care Guide

## Watering
- Water deeply but infrequently
- Allow soil to dry completely between waterings
- Water approximately every 3 weeks, less in winter
- Signs of overwatering: soft, mushy leaves
- Signs of underwatering: thin, curled leaves

## Light
- Prefers bright, indirect light
- Can tolerate some direct sunlight when acclimated
- Insufficient light causes leggy growth
- South or west-facing window is ideal

## Soil & Container
- Use well-draining cactus or succulent mix
- Add extra perlite or pumice for better drainage
- Always use pots with drainage holes
- Terracotta pots are excellent as they absorb excess moisture

## Fertilizing
- Fertilize sparingly - only 2-3 times per year
- Use diluted succulent fertilizer in spring and summer
- Do not fertilize in fall and winter

## Medicinal Properties
- Gel from leaves has soothing properties for minor burns and skin irritations
- Harvest by cutting outer mature leaves at the base
- Split leaf lengthwise to access the gel
- Fresh gel is most effective

## Propagation
- Produces offsets ("pups") around the base
- Carefully separate pups when they're a few inches tall
- Allow cut end to callus for 1-2 days before planting
- Water sparingly until established

## Common Issues
- Brown, mushy roots: Overwatering
- Brown, crispy leaf tips: Underwatering or too much direct sun
- Stretching/leaning: Insufficient light
- Flat, thin leaves: Underwatering
`,
    tags: ["medicinal", "drought-tolerant", "watering", "light", "propagation"]
  },
  
  "orchid": {
    content: `
# Phalaenopsis Orchid Care Guide

## Watering
- Water only when potting medium is dry
- Run water through the pot for 15-30 seconds
- Allow all water to drain completely
- Never leave standing water in decorative pot
- Water approximately once per week, less in winter

## Light
- Bright, indirect light is essential
- East or shaded west window is ideal
- Leaves should be bright green, not dark
- Yellow leaves may indicate too much light
- No leaf growth may indicate insufficient light

## Growing Medium
- Do not use regular potting soil
- Use specialty orchid bark mix or sphagnum moss
- Needs excellent airflow around roots
- Repot every 1-2 years as medium breaks down

## Humidity & Air Circulation
- Prefers humidity of 50-70%
- Use humidifier or pebble tray to increase humidity
- Good air circulation prevents root rot
- Avoid misting leaves as this can cause fungal issues

## Fertilizing
- "Weekly, weakly" approach - diluted fertilizer frequently
- Use orchid-specific fertilizer at quarter strength
- Do not fertilize when not in active growth
- Flush medium monthly to prevent salt buildup

## Blooming
- Flowers last 2-3 months when cared for properly
- After blooming, cut spike above node for potential reblooming
- Cut at base if spike turns brown
- Typically blooms 1-2 times per year
- Temperature drop at night (10°F) can trigger blooming

## Common Issues
- Wrinkled leaves: Underwatering
- Yellow, soft leaves: Overwatering
- No blooms: Insufficient light or improper temperature range
- Root rot: Visible as brown, mushy roots instead of plump, green ones
`,
    tags: ["watering", "humidity", "flowering", "light", "air circulation"]
  },
  
  "succulent": {
    content: `
# General Succulent Care Guide

## Watering
- "Soak and dry" method - thorough watering then complete drying
- Allow soil to dry completely between waterings
- Water approximately every 2-3 weeks, much less in winter
- Signs of overwatering: soft, mushy, translucent leaves
- Signs of underwatering: wrinkled, shriveled leaves

## Light
- Most succulents need bright, direct light for at least 6 hours daily
- South or west-facing windows are ideal
- Insufficient light causes etiolation (stretching)
- Some may need protection from intense afternoon sun
- Colorful varieties need more light to maintain vibrant colors

## Soil & Containers
- Use specially formulated succulent/cactus soil
- Add extra perlite, pumice, or coarse sand for better drainage
- Always use pots with drainage holes
- Terracotta pots are excellent as they wick away excess moisture
- Shallow, wide pots often better than deep ones

## Fertilizing
- Fertilize sparingly during growing season (usually spring/summer)
- Use diluted succulent/cactus fertilizer at half strength
- Do not fertilize during dormant periods
- Many succulents need little to no fertilizer

## Propagation
- Most propagate easily from leaves or stem cuttings
- Allow cuttings to callus (dry) for 2-3 days before planting
- Lay leaf cuttings on top of soil, don't bury
- Root development can take weeks to months
- Minimal watering until roots are established

## Seasonal Care
- Many succulents have seasonal growth patterns
- Reduce water significantly in winter
- Protect from frost as most are not cold-hardy
- Watch for signs of dormancy (slowed growth)
- Increase water gradually when active growth resumes

## Common Varieties
- Echeveria: Rosette-forming with powdery coating
- Haworthia: Often striped, tolerates lower light
- Sedum: Trailing or upright, very easy to propagate
- Crassula (Jade): Tree-like growth, thick stems
`,
    tags: ["drought-tolerant", "watering", "light", "propagation", "soil"]
  },
  
  "fern": {
    content: `
# Fern Care Guide

## Watering
- Keep soil consistently moist but not soggy
- Never allow soil to dry out completely
- Water when top inch of soil begins to feel dry
- Use room temperature water to avoid shock
- Increase watering frequency during hot, dry periods

## Light
- Prefer medium to low indirect light
- Avoid direct sunlight which can scorch fronds
- Too little light causes sparse, slow growth
- North or east-facing windows are ideal
- Can thrive under fluorescent lights

## Humidity
- High humidity is essential (50-70%+)
- Use humidifier for best results
- Pebble trays provide local humidity
- Mist fronds in the morning, not evening
- Grouping plants increases ambient humidity
- Brown, crispy tips indicate insufficient humidity

## Soil & Fertilizing
- Use rich, organic potting mix with good moisture retention
- Add peat moss or coco coir to improve moisture retention
- Fertilize monthly during growing season (spring-summer)
- Use balanced liquid fertilizer at half strength
- Do not fertilize in winter

## Pruning
- Remove damaged or brown fronds at the base
- Trim to shape sparingly
- New fronds unfurl from the center of the plant
- Leave old fronds until completely brown to allow nutrient reabsorption

## Common Types
- Boston Fern: Arching fronds, more tolerant of dry air
- Bird's Nest Fern: Wavy, tongue-like fronds, less demanding
- Maidenhair Fern: Delicate, requires consistent moisture
- Staghorn Fern: Epiphytic, can be mounted on boards
- Button Fern: Compact, withstands drier conditions

## Common Issues
- Brown fronds: Usually from low humidity or inconsistent watering
- Yellowing fronds: Often overwatering or poor drainage
- Pest susceptibility: Check for spider mites in dry conditions
- Sparse growth: Typically from insufficient light
`,
    tags: ["humidity", "watering", "indirect light", "moisture", "tropical"]
  },
  
  "cactus": {
    content: `
# Cactus Care Guide

## Watering
- Water sparingly - only when soil is completely dry
- During growing season, water approximately every 2-4 weeks
- In winter dormancy, reduce to once every 6-8 weeks or less
- "Soak and dry" method - thorough watering, then complete drying
- Always err on the side of underwatering

## Light
- Most cacti need bright, direct sunlight
- Minimum 4-6 hours of direct sun daily
- South or west-facing windows are ideal
- Rotate regularly for even growth
- Inadequate light causes weak, etiolated growth
- Acclimate gradually to outdoor summer sun to prevent sunburn

## Soil & Containers
- Extremely well-draining soil is essential
- Commercial cactus mix or regular potting soil with 50% added perlite
- Always use pots with drainage holes
- Unglazed terracotta pots are ideal for wicking away moisture
- Choose pots only slightly larger than the plant

## Fertilizing
- Fertilize sparingly during active growth (spring/summer)
- Use cactus-specific fertilizer at half strength
- Never fertilize in winter or when dormant
- Excessive fertilizer can cause weak, unsightly growth

## Seasonal Care
- Most cacti have winter dormancy period
- Reduce water and stop fertilizing during dormancy
- Some may need cooler temperatures to initiate blooming
- Gradually resume normal care when growth continues in spring

## Handling & Safety
- Always use thick gloves or folded newspaper when handling
- Some have nearly invisible glochids (hair-like spines)
- Long tweezers or tongs can help with repotting
- Keep away from children and pets

## Common Issues
- Soft, mushy stems: Almost always from overwatering
- Corky scars: Normal aging process in many species
- Lack of growth: Normal during dormancy or insufficient light
- Shriveling: Underwatering (rare) or root problems
- Pests: Watch for mealybugs and scale insects
`,
    tags: ["drought-tolerant", "light", "watering", "dormancy", "desert plants"]
  },
  
  "calathea": {
    content: `
# Calathea/Maranta (Prayer Plant) Care Guide

## Watering
- Keep soil consistently moist but not soggy
- Water when top inch of soil begins to dry
- Use only filtered, distilled or rainwater
- Extremely sensitive to fluoride and chlorine in tap water
- Water approximately once per week, adjusting to conditions

## Light
- Bright, indirect light is ideal
- Protect from direct sunlight which can fade patterns
- Too little light causes patterns to fade and reduced leaf movement
- North or east-facing windows work well
- Can tolerate moderate low light but will show reduced growth

## Humidity
- Requires high humidity (60%+)
- Use humidifier for best results
- Pebble trays provide some local humidity
- Regular misting helps but isn't sufficient alone
- Group with other plants to create humid microclimate
- Brown leaf edges indicate insufficient humidity

## Soil & Fertilizing
- Rich, well-draining potting mix
- Add peat moss or coco coir for moisture retention
- Fertilize monthly during growing season only
- Use balanced liquid fertilizer at quarter to half strength
- Flush soil every few months to prevent mineral buildup

## Unique Features
- Nyctinasty - leaves fold up at night (prayer-like movement)
- Vibrant patterns and colors vary by species
- Common varieties: Calathea orbifolia, C. medallion, Maranta leuconeura
- Sensitive to environmental changes and drafts

## Common Issues
- Crispy brown edges: Low humidity or mineral buildup from tap water
- Curling leaves: Underwatering or low humidity
- Yellowing leaves: Overwatering or direct sunlight
- Fading patterns: Too much light or aging leaves
- Spider mites: Common pest, especially in dry conditions
- Leaf not moving/opening: Low light or underwatering
`,
    tags: ["humidity", "leaf pattern", "filtered water", "tropical", "prayer plant"]
  }
};

// Helper function to provide advice for common issues
function getIssueAdvice(issue: string, plantType?: string): string {
  const issueLower = issue.toLowerCase();
  
  // Check for common issues
  if (issueLower.includes('yellow') && (issueLower.includes('leaf') || issueLower.includes('leaves'))) {
    return `Yellow leaves are most commonly caused by overwatering. Ensure you're allowing the soil to dry appropriately between waterings. Check that your pot has proper drainage and that water isn't collecting in the saucer.
    
Other potential causes include:
- Nutrient deficiency (especially nitrogen)
- Too much direct sunlight
- Pest infestation (check under leaves for insects)
- Natural aging (if only affecting older, lower leaves)

For your specific plant, reduce watering frequency and monitor for improvement over the next 2-3 weeks.`;
  }
  
  if (issueLower.includes('brown') && (issueLower.includes('tip') || issueLower.includes('edge'))) {
    return `Brown leaf tips or edges most commonly indicate low humidity or inconsistent watering. This is especially common with tropical plants.

Try these solutions:
- Increase humidity around your plant (use a humidifier or pebble tray)
- Use filtered water instead of tap water (minerals in tap water can cause browning)
- Maintain a more consistent watering schedule
- Ensure the plant isn't near heating vents or drafty windows

The existing brown areas won't return to green, but new growth should be healthy once the environment is adjusted.`;
  }
  
  if (issueLower.includes('drooping') || issueLower.includes('wilting')) {
    return `Drooping or wilting leaves typically indicate either underwatering or overwatering:

If the soil is dry several inches down:
- Your plant needs water immediately
- Consider increasing watering frequency slightly
- Ensure water is penetrating through all the soil, not just running down the sides of the pot

If the soil is still moist:
- You may be overwatering, causing root stress
- Allow the soil to dry out more between waterings
- Check that the pot has proper drainage
- Look for signs of root rot (dark, mushy roots with an unpleasant smell)

Recovery from severe wilting can take time, so be patient after adjusting your care routine.`;
  }
  
  if (issueLower.includes('spots')) {
    if (issueLower.includes('brown') || issueLower.includes('black')) {
      return `Brown or black spots on leaves can be caused by several issues:

Fungal infection:
- Remove affected leaves
- Improve air circulation around the plant
- Avoid getting water on the leaves when watering
- Consider a fungicide if the problem persists

Bacterial infection:
- Isolate the plant from others
- Remove and dispose of affected leaves
- Avoid misting or overhead watering
- Ensure good air circulation

Sunburn:
- Move plant away from direct, intense sunlight
- Provide filtered light instead

Water spots:
- If spots appear after watering, minerals in your water may be causing damage
- Consider using filtered or distilled water`;
    }
    
    if (issueLower.includes('white') || issueLower.includes('powder')) {
      return `White spots or powdery substance on leaves typically indicates powdery mildew or a pest infestation:

Powdery mildew (fungal infection):
- Improve air circulation around the plant
- Reduce humidity around the foliage (while maintaining appropriate humidity for the plant type)
- Remove severely affected leaves
- Apply a fungicide specifically formulated for powdery mildew

Pest infestation (likely mealybugs or scale):
- Isolate the plant from others
- Wipe leaves with a cotton swab dipped in 70% isopropyl alcohol
- For serious infestations, treat with insecticidal soap or neem oil
- Repeat treatments weekly until resolved`;
    }
  }
  
  if (issueLower.includes('stretching') || issueLower.includes('leggy')) {
    return `Stretching or leggy growth almost always indicates insufficient light. Plants naturally grow toward light sources and will become elongated when trying to reach adequate light.

Solutions:
- Move your plant to a brighter location
- Rotate the plant regularly to encourage even growth
- Consider supplemental grow lights if adequate natural light isn't available
- For severely leggy plants, pruning may encourage fuller growth once lighting is corrected

Once in better light, new growth should be more compact, but the stretched portions won't revert to a more compact form.`;
  }
  
  if (issueLower.includes('pest') || issueLower.includes('bug') || issueLower.includes('insect')) {
    return `For pest infestations, proper identification is key to effective treatment:

Common houseplant pests and treatments:

Spider mites:
- Tiny spider-like pests that cause stippling on leaves; may create fine webbing
- Increase humidity (they prefer dry conditions)
- Spray plants with water to dislodge mites
- Apply insecticidal soap or neem oil

Mealybugs:
- White, cottony insects found in leaf joints and under leaves
- Remove with cotton swab dipped in 70% isopropyl alcohol
- Treat with insecticidal soap or neem oil

Scale:
- Small, brown, shell-like insects that attach to stems and leaves
- Physically remove with fingernail or cotton swab with alcohol
- Treat with horticultural oil

Fungus gnats:
- Small flying insects in the soil
- Allow soil to dry thoroughly between waterings
- Use sticky traps
- Treat soil with BTI (Bacillus thuringiensis israelensis) products

For any pest treatment, repeat applications every 7-10 days for at least three treatments to break the life cycle.`;
  }
  
  // If no specific issue was matched, provide general troubleshooting advice
  return `For your issue regarding "${issue}", first observe these best practices:

1. Examine the plant thoroughly, including stems, under leaves, and soil surface
2. Consider recent changes in care, location, or environment
3. Document the progression of symptoms with photos
4. Isolate the plant if you suspect pests or disease

General troubleshooting steps:
- Check watering habits (over or under watering is the most common issue)
- Evaluate light conditions
- Inspect for pests
- Consider temperature and humidity levels
- Look for signs of outgrowing current pot

If symptoms worsen or the plant's condition deteriorates rapidly, consider consulting with a local plant specialist or garden center.`;
}

// Helper function to provide advice based on the plant description
function getDescriptionAdvice(description: string): string {
  const descLower = description.toLowerCase();
  let advice = '';
  
  // Environment advice
  if (descLower.includes('window') || descLower.includes('light')) {
    if (descLower.includes('south') || descLower.includes('west')) {
      advice += `You mentioned a south or west-facing location, which typically provides bright or direct light. Monitor your plant for signs of sun stress (scorching or bleaching of leaves) especially during summer months when light is most intense. Consider a sheer curtain to filter the strongest midday and afternoon light.\n\n`;
    } else if (descLower.includes('north') || descLower.includes('east')) {
      advice += `Your north or east-facing location provides gentler light, which works well for many houseplants. If your plant shows signs of stretching toward the light, it may need a brighter spot or rotating regularly.\n\n`;
    } else if (descLower.includes('low light') || descLower.includes('dark')) {
      advice += `You've described a low light environment. Consider low-light tolerant plants like snake plants, ZZ plants, or pothos. Most flowering plants and those with variegated leaves will need brighter conditions to thrive. You might want to consider supplemental grow lights if natural light is limited.\n\n`;
    }
  }
  
  // Watering habits
  if (descLower.includes('water') || descLower.includes('moist') || descLower.includes('dry')) {
    if (descLower.includes('forget') || descLower.includes('busy')) {
      advice += `Since you mentioned you sometimes forget to water or have a busy schedule, consider plants that tolerate irregular watering like succulents, ZZ plants, snake plants, or pothos. Setting calendar reminders or using a moisture meter can help establish a better watering routine.\n\n`;
    } else if (descLower.includes('overwater') || descLower.includes('too much water')) {
      advice += `You mentioned concerns about overwatering. Always check that soil is dry to the appropriate depth before watering again. Consider using pots with drainage holes and well-draining soil mixes. A moisture meter can be helpful for those who tend to overwater.\n\n`;
    }
  }
  
  // Home conditions
  if (descLower.includes('humid') || descLower.includes('bathroom') || descLower.includes('kitchen')) {
    advice += `Your description indicates a potentially humid environment. Plants like ferns, calatheas, and other tropical varieties would likely thrive in these conditions. If you're growing plants that prefer lower humidity, ensure good air circulation to prevent fungal issues.\n\n`;
  } else if (descLower.includes('dry') || descLower.includes('heat') || descLower.includes('air conditioner')) {
    advice += `Your home environment sounds like it may be on the drier side. Consider using a humidifier or pebble trays for humidity-loving plants. Plants like succulents, cacti, and snake plants will naturally do better in drier conditions.\n\n`;
  }
  
  // Pet safety
  if (descLower.includes('cat') || descLower.includes('dog') || descLower.includes('pet')) {
    advice += `You mentioned having pets. It's important to verify that your plants are non-toxic to animals. Some pet-friendly options include spider plants, Boston ferns, areca palms, and calathea varieties. Avoid lilies, pothos, philodendrons, and many other common houseplants that can be toxic if ingested by pets.\n\n`;
  }
  
  // If no specific description elements were matched
  if (advice === '') {
    advice = `Based on your description, continue to observe how your plant responds to its current care routine and environment. Make small adjustments as needed based on your plant's signals (leaf color, growth patterns, soil moisture). Taking progress photos every few weeks can help you track subtle changes in your plant's health and growth.`;
  }
  
  return advice;
}

// Helper function to suggest watering frequency based on plant type
export function suggestWateringFrequency(plantName: string, plantSpecies?: string): number {
  const normalizedPlantName = plantName.toLowerCase().trim();
  const normalizedSpecies = plantSpecies ? plantSpecies.toLowerCase().trim() : '';
  
  // Default watering frequency (in days) if no match is found
  const defaultFrequency = 7;
  
  // Create a combined search string
  const searchString = `${normalizedPlantName} ${normalizedSpecies}`.toLowerCase();
  
  // Check for specific plant types with known watering frequencies
  if (searchString.includes('monstera') || searchString.includes('deliciosa')) {
    return 7; // Once every 7 days
  }
  
  if (searchString.includes('fiddle leaf') || searchString.includes('ficus lyrata')) {
    return 7; // Once every 7 days
  }
  
  if (searchString.includes('pothos') || searchString.includes('epipremnum')) {
    return 10; // Once every 10 days
  }
  
  if (searchString.includes('snake plant') || searchString.includes('sansevieria')) {
    return 21; // Once every 3 weeks
  }
  
  if (searchString.includes('zz plant') || searchString.includes('zamioculcas')) {
    return 21; // Once every 3 weeks
  }
  
  if (searchString.includes('peace lily') || searchString.includes('spathiphyllum')) {
    return 5; // Once every 5 days (likes consistently moist soil)
  }
  
  if (searchString.includes('orchid') || searchString.includes('phalaenopsis')) {
    return 7; // Once every 7 days
  }
  
  if (searchString.includes('aloe') || searchString.includes('cactus') || 
      searchString.includes('succulent') || searchString.includes('haworthia')) {
    return 14; // Once every 2 weeks
  }
  
  if (searchString.includes('fern') || searchString.includes('calathea') || 
      searchString.includes('maranta') || searchString.includes('prayer plant')) {
    return 3; // Every 3 days (likes humidity and moisture)
  }
  
  return defaultFrequency;
}

// Get basic care instructions for a plant
export function getBasicCareInstructions(plantName: string, plantSpecies?: string | null): string {
  const normalizedPlantName = plantName.toLowerCase().trim();
  
  // Look for specific plant matches in our database
  const plantTypes = Object.keys(plantCareDatabase);
  
  // Try to find the best match
  const matchingPlant = plantTypes.find(plant => 
    normalizedPlantName.includes(plant) || 
    (plantSpecies && plantSpecies.toLowerCase().includes(plant))
  );
  
  if (matchingPlant && matchingPlant !== 'default') {
    // Extract first few sections from the plant care database
    const plantInfo = plantCareDatabase[matchingPlant as keyof typeof plantCareDatabase];
    const content = plantInfo.content;
    
    // Extract introduction, watering, and light sections
    const sections = content.split('##').slice(0, 3).join('##');
    
    // Replace plant name with the user's plant name
    return sections.replace(
      new RegExp(matchingPlant, 'gi'), 
      plantName
    );
  } else {
    // Return generic care instructions
    return `
# Care Guide for ${plantName}${plantSpecies ? ` (${plantSpecies})` : ''}

## Watering
- Check the top 1-2 inches of soil; water when dry
- Use room temperature water to avoid shocking roots
- Adjust watering frequency based on season and environment

## Light
- Most houseplants prefer bright, indirect light
- Avoid direct sunlight which can scorch leaves
- Rotate plants regularly to ensure even growth
`;
  }
}

export async function getAIRecommendation({
  plantName,
  plantSpecies,
  careIssue,
  plantDescription
}: {
  plantName: string;
  plantSpecies?: string;
  careIssue?: string;
  plantDescription?: string;
}) {
  // No need to check for API key anymore since we're using our local database
  
  // Normalize the plant name for lookup
  const normalizedPlantName = plantName.toLowerCase().trim();
  
  // Search for matching plant care information
  let content = '';
  let tags: string[] = [];
  
  // Look for exact matches or keywords in our database
  const plantTypes = Object.keys(plantCareDatabase);
  
  // Try to find the best match
  const matchingPlant = plantTypes.find(plant => 
    normalizedPlantName.includes(plant) || 
    (plantSpecies && plantSpecies.toLowerCase().includes(plant))
  );
  
  if (matchingPlant && matchingPlant !== 'default') {
    // Found a specific plant match
    // Need to type-check when accessing plant care database
    const plantInfo = plantCareDatabase[matchingPlant as keyof typeof plantCareDatabase];
    content = plantInfo.content;
    tags = plantInfo.tags;
    
    // Personalize the content with the user's plant name
    content = content.replace(
      new RegExp(matchingPlant, 'gi'), 
      plantName
    );
    
    // If there's a care issue, add a note about it
    if (careIssue) {
      content += `\n\n## Specific Issue: ${careIssue}\n`;
      content += getIssueAdvice(careIssue, matchingPlant);
    }
  } else {
    // Use default care information
    content = plantCareDatabase.default.content;
    tags = plantCareDatabase.default.tags;
    
    // Personalize with plant name
    content = `# Care Guide for ${plantName}\n` + content.substring(content.indexOf('\n'));
    
    // Add note about specific plant variety if provided
    if (plantSpecies) {
      content = content.replace(
        "# Care Guide", 
        `# Care Guide for ${plantName} (${plantSpecies})`
      );
    }
    
    // If there's a care issue, add a note about it
    if (careIssue) {
      content += `\n\n## Specific Issue: ${careIssue}\n`;
      content += getIssueAdvice(careIssue);
    }
  }
  
  // If there's a plant description, acknowledge it
  if (plantDescription) {
    content += `\n\n## Based on Your Description\n`;
    content += `You mentioned: "${plantDescription}"\n\n`;
    content += getDescriptionAdvice(plantDescription);
  }
  
  // Add a personalized note at the end
  content += `\n\n---\n\nThis care guide is specifically tailored for your ${plantName}. Adjust recommendations based on your specific growing conditions and observe how your plant responds. Remember that each plant is unique, and care requirements may vary slightly based on your home environment.`;
  
  return {
    content,
    tags
  };
}

// Helper function to extract meaningful tags from the AI response
function extractTags(content: string): string[] {
  const commonTags = [
    "watering", "light", "humidity", "fertilizing", "soil", 
    "temperature", "pests", "diseases", "propagation", "pruning", 
    "repotting", "leaf health", "root health", "seasonal care"
  ];
  
  const foundTags = commonTags.filter(tag => 
    content.toLowerCase().includes(tag.toLowerCase())
  );
  
  // Limit to top 5 tags
  return foundTags.slice(0, 5);
}
