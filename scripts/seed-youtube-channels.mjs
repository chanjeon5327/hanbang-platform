import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(url, key);

const samples = [
  // title, category, tags, keywords
  ['침착맨', '토크', ['토크','예능','게임'], ['침착맨','토크']],
  ['곽튜브', '여행', ['여행','먹방','브이로그'], ['여행','한국','해외']],
  ['피식대학', '예능', ['예능','코미디'], ['피식','코미디']],
  ['슈카월드', '시사', ['시사','경제','토크'], ['경제','시사']],
  ['워크맨', '예능', ['예능','직업','브이로그'], ['직업','예능']],
  ['문명특급', '토크', ['토크','연예','인터뷰'], ['인터뷰','연예']],
  ['백종원', '먹방', ['요리','먹방'], ['레시피','요리']],
  ['1분미만', '드라마', ['드라마','쇼츠'], ['쇼츠','드라마']],
];

function makeMany(n=120){
  const out = [];
  for(let i=0;i<n;i++){
    const base = samples[i % samples.length];
    out.push({
      youtube_channel_id: `SAMPLE_${i+1}`,
      title: `${base[0]} 샘플 ${i+1}`,
      category: base[1],
      tags: base[2],
      host_gender: i%2===0 ? 'm' : 'f',
      audience_age: ['10s','20s','30s','40s'][i%4],
      keywords: base[3],
      thumbnail_url: `https://placehold.co/320x180?text=CH+${i+1}`,
    });
  }
  return out;
}

const rows = makeMany(120);

const { error } = await supabase.from('youtube_channels').upsert(rows, { onConflict: 'youtube_channel_id' });
if (error) {
  console.error(error);
  process.exit(1);
}
console.log('seed ok:', rows.length);
