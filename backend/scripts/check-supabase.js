import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY/ANON_KEY in environment.'
  );
  process.exit(1);
}

const supabase = createClient(url, key);

(async () => {
  try {
    // Insert a test row with a valid UUID
    const testId = uuidv4();
    const { error: insertError, data: insertData } = await supabase
      .from('prompt_logs')
      .insert([{ id: testId }]);
    if (insertError) {
      console.error('❌ Supabase insert failed:', insertError.message);
      process.exit(1);
    }
    console.log('✅ Inserted test row:', insertData);

    // Select the test row
    const { error: selectError, data: selectData } = await supabase
      .from('prompt_logs')
      .select('id')
      .eq('id', testId)
      .limit(1);
    if (selectError) {
      console.error('❌ Supabase select failed:', selectError.message);
      process.exit(1);
    }
    if (selectData && selectData.length > 0) {
      console.log(
        '✅ Supabase connectivity OK, test row found:',
        selectData[0]
      );
      // Clean up: delete the test row
      const { error: deleteError } = await supabase
        .from('prompt_logs')
        .delete()
        .eq('id', testId);
      if (deleteError) {
        console.error('⚠️  Cleanup failed:', deleteError.message);
      } else {
        console.log('🧹 Test row cleaned up.');
      }
      process.exit(0);
    } else {
      console.error('❌ Test row not found after insert.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
})();
