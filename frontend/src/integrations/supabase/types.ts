export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      airtable_sync: {
        Row: {
          config_id: string | null;
          created_at: string | null;
          errors_count: number | null;
          id: string;
          last_sync: string | null;
          records_synced: number | null;
          sync_log: Json | null;
          sync_status: string | null;
          table_name: string;
          updated_at: string | null;
        };
        Insert: {
          config_id?: string | null;
          created_at?: string | null;
          errors_count?: number | null;
          id?: string;
          last_sync?: string | null;
          records_synced?: number | null;
          sync_log?: Json | null;
          sync_status?: string | null;
          table_name: string;
          updated_at?: string | null;
        };
        Update: {
          config_id?: string | null;
          created_at?: string | null;
          errors_count?: number | null;
          id?: string;
          last_sync?: string | null;
          records_synced?: number | null;
          sync_log?: Json | null;
          sync_status?: string | null;
          table_name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_sync_config';
            columns: ['config_id'];
            isOneToOne: false;
            referencedRelation: 'system_configs';
            referencedColumns: ['id'];
          },
        ];
      };
      analytics_aggregates: {
        Row: {
          aggregate_type: string;
          created_at: string | null;
          granularity: string | null;
          id: string;
          metrics: Json | null;
          period_end: string | null;
          period_start: string | null;
          prompt_type_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          aggregate_type: string;
          created_at?: string | null;
          granularity?: string | null;
          id?: string;
          metrics?: Json | null;
          period_end?: string | null;
          period_start?: string | null;
          prompt_type_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          aggregate_type?: string;
          created_at?: string | null;
          granularity?: string | null;
          id?: string;
          metrics?: Json | null;
          period_end?: string | null;
          period_start?: string | null;
          prompt_type_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_analytics_prompt_type';
            columns: ['prompt_type_id'];
            isOneToOne: false;
            referencedRelation: 'prompt_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_analytics_prompt_type';
            columns: ['prompt_type_id'];
            isOneToOne: false;
            referencedRelation: 'prompt_types_rollups';
            referencedColumns: ['id'];
          },
        ];
      };
      competitive_advantage_metrics: {
        Row: {
          comparison_id: string | null;
          competitive_differentiation: number | null;
          competitive_moat_strength: number | null;
          created_at: string | null;
          emotional_intelligence_advantage: number | null;
          id: string;
          market_leadership_score: number | null;
          replication_difficulty: number | null;
          trust_transparency_advantage: number | null;
          unbeatable_factors: Json | null;
          user_empowerment_advantage: number | null;
          user_loyalty_impact: number | null;
          word_of_mouth_potential: number | null;
        };
        Insert: {
          comparison_id?: string | null;
          competitive_differentiation?: number | null;
          competitive_moat_strength?: number | null;
          created_at?: string | null;
          emotional_intelligence_advantage?: number | null;
          id?: string;
          market_leadership_score?: number | null;
          replication_difficulty?: number | null;
          trust_transparency_advantage?: number | null;
          unbeatable_factors?: Json | null;
          user_empowerment_advantage?: number | null;
          user_loyalty_impact?: number | null;
          word_of_mouth_potential?: number | null;
        };
        Update: {
          comparison_id?: string | null;
          competitive_differentiation?: number | null;
          competitive_moat_strength?: number | null;
          created_at?: string | null;
          emotional_intelligence_advantage?: number | null;
          id?: string;
          market_leadership_score?: number | null;
          replication_difficulty?: number | null;
          trust_transparency_advantage?: number | null;
          unbeatable_factors?: Json | null;
          user_empowerment_advantage?: number | null;
          user_loyalty_impact?: number | null;
          word_of_mouth_potential?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'competitive_advantage_metrics_comparison_id_fkey';
            columns: ['comparison_id'];
            isOneToOne: false;
            referencedRelation: 'sparksplit_comparisons';
            referencedColumns: ['id'];
          },
        ];
      };
      emotional_intelligence: {
        Row: {
          confidence_level: number | null;
          created_at: string | null;
          emotional_journey: Json | null;
          emotional_state: string | null;
          growth_indicators: Json | null;
          id: string;
          motivation_factors: string[] | null;
          peak_moments: Json | null;
          session_id: string;
          stress_indicators: string[] | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          confidence_level?: number | null;
          created_at?: string | null;
          emotional_journey?: Json | null;
          emotional_state?: string | null;
          growth_indicators?: Json | null;
          id?: string;
          motivation_factors?: string[] | null;
          peak_moments?: Json | null;
          session_id: string;
          stress_indicators?: string[] | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          confidence_level?: number | null;
          created_at?: string | null;
          emotional_journey?: Json | null;
          emotional_state?: string | null;
          growth_indicators?: Json | null;
          id?: string;
          motivation_factors?: string[] | null;
          peak_moments?: Json | null;
          session_id?: string;
          stress_indicators?: string[] | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_emotional_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_emotional_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics_rollups';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_emotional_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'quantum_user_intelligence';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'fk_emotional_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_context';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'fk_emotional_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_context_rollups';
            referencedColumns: ['user_id'];
          },
        ];
      };
      emotional_states: {
        Row: {
          awe_influence: number | null;
          calm_influence: number | null;
          category: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          intensity_level: number | null;
          ownership_influence: number | null;
          power_influence: number | null;
          state_name: string;
          updated_at: string | null;
          wonder_influence: number | null;
        };
        Insert: {
          awe_influence?: number | null;
          calm_influence?: number | null;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          intensity_level?: number | null;
          ownership_influence?: number | null;
          power_influence?: number | null;
          state_name: string;
          updated_at?: string | null;
          wonder_influence?: number | null;
        };
        Update: {
          awe_influence?: number | null;
          calm_influence?: number | null;
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          intensity_level?: number | null;
          ownership_influence?: number | null;
          power_influence?: number | null;
          state_name?: string;
          updated_at?: string | null;
          wonder_influence?: number | null;
        };
        Relationships: [];
      };
      error_logs: {
        Row: {
          created_at: string | null;
          error_context: Json | null;
          error_message: string | null;
          error_stack: string | null;
          error_type: string | null;
          id: string;
          recovery_attempted: boolean | null;
          recovery_method: string | null;
          recovery_successful: boolean | null;
          session_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          error_context?: Json | null;
          error_message?: string | null;
          error_stack?: string | null;
          error_type?: string | null;
          id?: string;
          recovery_attempted?: boolean | null;
          recovery_method?: string | null;
          recovery_successful?: boolean | null;
          session_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          error_context?: Json | null;
          error_message?: string | null;
          error_stack?: string | null;
          error_type?: string | null;
          id?: string;
          recovery_attempted?: boolean | null;
          recovery_method?: string | null;
          recovery_successful?: boolean | null;
          session_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_error_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_error_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics_rollups';
            referencedColumns: ['session_id'];
          },
        ];
      };
      goldmine_output: {
        Row: {
          compound_value: number | null;
          content_vector: string | null;
          created_at: string | null;
          emotional_fingerprint: Json | null;
          id: string;
          industry_cluster: string | null;
          intent_summary: string | null;
          output_content: string;
          output_hash: string | null;
          prompt_type: string | null;
          resonance_score: number | null;
          reuse_category: string | null;
          reuse_potential: number | null;
          session_id: string;
          spark_concept: string | null;
          trust_score: number | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          compound_value?: number | null;
          content_vector?: string | null;
          created_at?: string | null;
          emotional_fingerprint?: Json | null;
          id?: string;
          industry_cluster?: string | null;
          intent_summary?: string | null;
          output_content: string;
          output_hash?: string | null;
          prompt_type?: string | null;
          resonance_score?: number | null;
          reuse_category?: string | null;
          reuse_potential?: number | null;
          session_id: string;
          spark_concept?: string | null;
          trust_score?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          compound_value?: number | null;
          content_vector?: string | null;
          created_at?: string | null;
          emotional_fingerprint?: Json | null;
          id?: string;
          industry_cluster?: string | null;
          intent_summary?: string | null;
          output_content?: string;
          output_hash?: string | null;
          prompt_type?: string | null;
          resonance_score?: number | null;
          reuse_category?: string | null;
          reuse_potential?: number | null;
          session_id?: string;
          spark_concept?: string | null;
          trust_score?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_goldmine_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_goldmine_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics_rollups';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_goldmine_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'quantum_user_intelligence';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'fk_goldmine_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_context';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'fk_goldmine_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_context_rollups';
            referencedColumns: ['user_id'];
          },
        ];
      };
      performance_metrics: {
        Row: {
          api_calls: number | null;
          cpu_usage: number | null;
          created_at: string | null;
          error_rate: number | null;
          id: string;
          memory_usage: number | null;
          response_time: number | null;
          session_id: string;
          token_efficiency: number | null;
          updated_at: string | null;
          uptime_percentage: number | null;
        };
        Insert: {
          api_calls?: number | null;
          cpu_usage?: number | null;
          created_at?: string | null;
          error_rate?: number | null;
          id?: string;
          memory_usage?: number | null;
          response_time?: number | null;
          session_id: string;
          token_efficiency?: number | null;
          updated_at?: string | null;
          uptime_percentage?: number | null;
        };
        Update: {
          api_calls?: number | null;
          cpu_usage?: number | null;
          created_at?: string | null;
          error_rate?: number | null;
          id?: string;
          memory_usage?: number | null;
          response_time?: number | null;
          session_id?: string;
          token_efficiency?: number | null;
          updated_at?: string | null;
          uptime_percentage?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_performance_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_performance_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics_rollups';
            referencedColumns: ['session_id'];
          },
        ];
      };
      processing_results: {
        Row: {
          created_at: string | null;
          id: string;
          metadata: Json | null;
          output_quality: number | null;
          pipeline_stage: string | null;
          processing_time: number | null;
          results: Json | null;
          session_id: string;
          success_rate: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          output_quality?: number | null;
          pipeline_stage?: string | null;
          processing_time?: number | null;
          results?: Json | null;
          session_id: string;
          success_rate?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          output_quality?: number | null;
          pipeline_stage?: string | null;
          processing_time?: number | null;
          results?: Json | null;
          session_id?: string;
          success_rate?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_processing_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_processing_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics_rollups';
            referencedColumns: ['session_id'];
          },
        ];
      };
      prompt_logs: {
        Row: {
          analytics_meta: Json | null;
          awe_score: number | null;
          calm_score: number | null;
          consent_given: boolean | null;
          content_vector: string | null;
          cost_usd: number | null;
          created_at: string | null;
          deletion_requested: boolean | null;
          emotional_depth: number | null;
          fallback_fields: string[] | null;
          fallback_triggered: boolean | null;
          id: string;
          input_fields: Json;
          output: Json | null;
          ownership_score: number | null;
          power_score: number | null;
          prompt_type: string;
          resonance_score: number | null;
          session_id: string;
          smart_prompt_score: number | null;
          timestamp: string;
          tokens_used: number | null;
          trust_score: number | null;
          updated_at: string | null;
          user_id: string;
          wonder_score: number | null;
        };
        Insert: {
          analytics_meta?: Json | null;
          awe_score?: number | null;
          calm_score?: number | null;
          consent_given?: boolean | null;
          content_vector?: string | null;
          cost_usd?: number | null;
          created_at?: string | null;
          deletion_requested?: boolean | null;
          emotional_depth?: number | null;
          fallback_fields?: string[] | null;
          fallback_triggered?: boolean | null;
          id?: string;
          input_fields: Json;
          output?: Json | null;
          ownership_score?: number | null;
          power_score?: number | null;
          prompt_type: string;
          resonance_score?: number | null;
          session_id: string;
          smart_prompt_score?: number | null;
          timestamp?: string;
          tokens_used?: number | null;
          trust_score?: number | null;
          updated_at?: string | null;
          user_id: string;
          wonder_score?: number | null;
        };
        Update: {
          analytics_meta?: Json | null;
          awe_score?: number | null;
          calm_score?: number | null;
          consent_given?: boolean | null;
          content_vector?: string | null;
          cost_usd?: number | null;
          created_at?: string | null;
          deletion_requested?: boolean | null;
          emotional_depth?: number | null;
          fallback_fields?: string[] | null;
          fallback_triggered?: boolean | null;
          id?: string;
          input_fields?: Json;
          output?: Json | null;
          ownership_score?: number | null;
          power_score?: number | null;
          prompt_type?: string;
          resonance_score?: number | null;
          session_id?: string;
          smart_prompt_score?: number | null;
          timestamp?: string;
          tokens_used?: number | null;
          trust_score?: number | null;
          updated_at?: string | null;
          user_id?: string;
          wonder_score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_prompt_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_prompt_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics_rollups';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_prompt_type';
            columns: ['prompt_type'];
            isOneToOne: false;
            referencedRelation: 'prompt_types';
            referencedColumns: ['prompt_type'];
          },
          {
            foreignKeyName: 'fk_prompt_type';
            columns: ['prompt_type'];
            isOneToOne: false;
            referencedRelation: 'prompt_types_rollups';
            referencedColumns: ['prompt_type'];
          },
          {
            foreignKeyName: 'fk_prompt_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'quantum_user_intelligence';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'fk_prompt_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_context';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'fk_prompt_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_context_rollups';
            referencedColumns: ['user_id'];
          },
        ];
      };
      prompt_types: {
        Row: {
          average_cost_per_use: number | null;
          average_trust_score: number | null;
          category: string | null;
          complexity_level: string | null;
          created_at: string | null;
          description: string | null;
          display_name: string | null;
          id: string;
          input_schema: Json | null;
          is_active: boolean | null;
          output_schema: Json | null;
          prompt_type: string;
          total_usage_count: number | null;
          updated_at: string | null;
        };
        Insert: {
          average_cost_per_use?: number | null;
          average_trust_score?: number | null;
          category?: string | null;
          complexity_level?: string | null;
          created_at?: string | null;
          description?: string | null;
          display_name?: string | null;
          id?: string;
          input_schema?: Json | null;
          is_active?: boolean | null;
          output_schema?: Json | null;
          prompt_type: string;
          total_usage_count?: number | null;
          updated_at?: string | null;
        };
        Update: {
          average_cost_per_use?: number | null;
          average_trust_score?: number | null;
          category?: string | null;
          complexity_level?: string | null;
          created_at?: string | null;
          description?: string | null;
          display_name?: string | null;
          id?: string;
          input_schema?: Json | null;
          is_active?: boolean | null;
          output_schema?: Json | null;
          prompt_type?: string;
          total_usage_count?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      session_analytics: {
        Row: {
          awe_score: number | null;
          calm_score: number | null;
          cohort: string | null;
          created_at: string | null;
          drop_off_signal: boolean | null;
          duration: number | null;
          emotional_depth: number | null;
          end_time: string | null;
          id: string;
          override_count: number | null;
          ownership_score: number | null;
          power_score: number | null;
          primary_product: string | null;
          products_used: string[] | null;
          prompt_count: number | null;
          session_id: string;
          start_time: string;
          status: string | null;
          time_to_confirmation: number | null;
          trust_delta: number | null;
          trust_score_after: number | null;
          trust_score_before: number | null;
          updated_at: string | null;
          user_id: string | null;
          webhook_response: Json | null;
          webhook_scenario: string | null;
          webhook_triggered: boolean | null;
          wonder_score: number | null;
        };
        Insert: {
          awe_score?: number | null;
          calm_score?: number | null;
          cohort?: string | null;
          created_at?: string | null;
          drop_off_signal?: boolean | null;
          duration?: number | null;
          emotional_depth?: number | null;
          end_time?: string | null;
          id?: string;
          override_count?: number | null;
          ownership_score?: number | null;
          power_score?: number | null;
          primary_product?: string | null;
          products_used?: string[] | null;
          prompt_count?: number | null;
          session_id: string;
          start_time?: string;
          status?: string | null;
          time_to_confirmation?: number | null;
          trust_delta?: number | null;
          trust_score_after?: number | null;
          trust_score_before?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
          webhook_response?: Json | null;
          webhook_scenario?: string | null;
          webhook_triggered?: boolean | null;
          wonder_score?: number | null;
        };
        Update: {
          awe_score?: number | null;
          calm_score?: number | null;
          cohort?: string | null;
          created_at?: string | null;
          drop_off_signal?: boolean | null;
          duration?: number | null;
          emotional_depth?: number | null;
          end_time?: string | null;
          id?: string;
          override_count?: number | null;
          ownership_score?: number | null;
          power_score?: number | null;
          primary_product?: string | null;
          products_used?: string[] | null;
          prompt_count?: number | null;
          session_id?: string;
          start_time?: string;
          status?: string | null;
          time_to_confirmation?: number | null;
          trust_delta?: number | null;
          trust_score_after?: number | null;
          trust_score_before?: number | null;
          updated_at?: string | null;
          user_id?: string | null;
          webhook_response?: Json | null;
          webhook_scenario?: string | null;
          webhook_triggered?: boolean | null;
          wonder_score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_session_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'quantum_user_intelligence';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'fk_session_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_context';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'fk_session_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_context_rollups';
            referencedColumns: ['user_id'];
          },
        ];
      };
      sparksplit_analytics: {
        Row: {
          awe_score: number | null;
          calm_score: number | null;
          canai_output: string | null;
          circuit_breaker_triggered: boolean | null;
          comparison_id: string | null;
          competitive_advantage: number | null;
          comprehension_score: number | null;
          created_at: string | null;
          educational_moment: boolean | null;
          emotional_education_score: number | null;
          id: string;
          ownership_score: number | null;
          power_score: number | null;
          prompt_type: string | null;
          session_id: string;
          shared_output: boolean | null;
          sterile_output: string | null;
          time_to_selection: number | null;
          timestamp: number;
          trust_delta: number | null;
          trust_transparency_score: number | null;
          updated_at: string | null;
          user_selection: string | null;
          wonder_score: number | null;
          would_refer: boolean | null;
        };
        Insert: {
          awe_score?: number | null;
          calm_score?: number | null;
          canai_output?: string | null;
          circuit_breaker_triggered?: boolean | null;
          comparison_id?: string | null;
          competitive_advantage?: number | null;
          comprehension_score?: number | null;
          created_at?: string | null;
          educational_moment?: boolean | null;
          emotional_education_score?: number | null;
          id?: string;
          ownership_score?: number | null;
          power_score?: number | null;
          prompt_type?: string | null;
          session_id: string;
          shared_output?: boolean | null;
          sterile_output?: string | null;
          time_to_selection?: number | null;
          timestamp: number;
          trust_delta?: number | null;
          trust_transparency_score?: number | null;
          updated_at?: string | null;
          user_selection?: string | null;
          wonder_score?: number | null;
          would_refer?: boolean | null;
        };
        Update: {
          awe_score?: number | null;
          calm_score?: number | null;
          canai_output?: string | null;
          circuit_breaker_triggered?: boolean | null;
          comparison_id?: string | null;
          competitive_advantage?: number | null;
          comprehension_score?: number | null;
          created_at?: string | null;
          educational_moment?: boolean | null;
          emotional_education_score?: number | null;
          id?: string;
          ownership_score?: number | null;
          power_score?: number | null;
          prompt_type?: string | null;
          session_id?: string;
          shared_output?: boolean | null;
          sterile_output?: string | null;
          time_to_selection?: number | null;
          timestamp?: number;
          trust_delta?: number | null;
          trust_transparency_score?: number | null;
          updated_at?: string | null;
          user_selection?: string | null;
          wonder_score?: number | null;
          would_refer?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_sparksplit_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_sparksplit_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics_rollups';
            referencedColumns: ['session_id'];
          },
        ];
      };
      sparksplit_comparisons: {
        Row: {
          canai_awe_score: number | null;
          canai_calm_score: number | null;
          canai_generation_time_ms: number | null;
          canai_output: Json;
          canai_ownership_score: number | null;
          canai_power_score: number | null;
          canai_wonder_score: number | null;
          circuit_breaker_triggered: boolean | null;
          competitive_advantage: number | null;
          competitive_insights: Json | null;
          completed_at: string | null;
          created_at: string | null;
          educational_value: number | null;
          emotional_education_score: number | null;
          emotional_sovereignty_preserved: boolean | null;
          generation_time_ms: number | null;
          id: string;
          prompt_type: string;
          revolutionary_positioning: number | null;
          sacred_reversal_passed: boolean | null;
          session_id: string;
          shared_output: boolean | null;
          sterile_awe_score: number | null;
          sterile_calm_score: number | null;
          sterile_generation_time_ms: number | null;
          sterile_output: Json;
          sterile_ownership_score: number | null;
          sterile_power_score: number | null;
          sterile_wonder_score: number | null;
          time_to_selection: number | null;
          trust_building_moments: Json | null;
          trust_delta: number;
          trust_transparency_score: number | null;
          updated_at: string | null;
          user_context: Json | null;
          user_empowerment_increased: boolean | null;
          user_id: string | null;
          user_input: Json;
          user_selection: string | null;
          viral_potential_score: number | null;
          would_refer: boolean | null;
        };
        Insert: {
          canai_awe_score?: number | null;
          canai_calm_score?: number | null;
          canai_generation_time_ms?: number | null;
          canai_output: Json;
          canai_ownership_score?: number | null;
          canai_power_score?: number | null;
          canai_wonder_score?: number | null;
          circuit_breaker_triggered?: boolean | null;
          competitive_advantage?: number | null;
          competitive_insights?: Json | null;
          completed_at?: string | null;
          created_at?: string | null;
          educational_value?: number | null;
          emotional_education_score?: number | null;
          emotional_sovereignty_preserved?: boolean | null;
          generation_time_ms?: number | null;
          id?: string;
          prompt_type: string;
          revolutionary_positioning?: number | null;
          sacred_reversal_passed?: boolean | null;
          session_id: string;
          shared_output?: boolean | null;
          sterile_awe_score?: number | null;
          sterile_calm_score?: number | null;
          sterile_generation_time_ms?: number | null;
          sterile_output: Json;
          sterile_ownership_score?: number | null;
          sterile_power_score?: number | null;
          sterile_wonder_score?: number | null;
          time_to_selection?: number | null;
          trust_building_moments?: Json | null;
          trust_delta?: number;
          trust_transparency_score?: number | null;
          updated_at?: string | null;
          user_context?: Json | null;
          user_empowerment_increased?: boolean | null;
          user_id?: string | null;
          user_input: Json;
          user_selection?: string | null;
          viral_potential_score?: number | null;
          would_refer?: boolean | null;
        };
        Update: {
          canai_awe_score?: number | null;
          canai_calm_score?: number | null;
          canai_generation_time_ms?: number | null;
          canai_output?: Json;
          canai_ownership_score?: number | null;
          canai_power_score?: number | null;
          canai_wonder_score?: number | null;
          circuit_breaker_triggered?: boolean | null;
          competitive_advantage?: number | null;
          competitive_insights?: Json | null;
          completed_at?: string | null;
          created_at?: string | null;
          educational_value?: number | null;
          emotional_education_score?: number | null;
          emotional_sovereignty_preserved?: boolean | null;
          generation_time_ms?: number | null;
          id?: string;
          prompt_type?: string;
          revolutionary_positioning?: number | null;
          sacred_reversal_passed?: boolean | null;
          session_id?: string;
          shared_output?: boolean | null;
          sterile_awe_score?: number | null;
          sterile_calm_score?: number | null;
          sterile_generation_time_ms?: number | null;
          sterile_output?: Json;
          sterile_ownership_score?: number | null;
          sterile_power_score?: number | null;
          sterile_wonder_score?: number | null;
          time_to_selection?: number | null;
          trust_building_moments?: Json | null;
          trust_delta?: number;
          trust_transparency_score?: number | null;
          updated_at?: string | null;
          user_context?: Json | null;
          user_empowerment_increased?: boolean | null;
          user_id?: string | null;
          user_input?: Json;
          user_selection?: string | null;
          viral_potential_score?: number | null;
          would_refer?: boolean | null;
        };
        Relationships: [];
      };
      system_configs: {
        Row: {
          config_key: string;
          config_type: string | null;
          config_value: Json | null;
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          updated_at: string | null;
          validation_schema: Json | null;
        };
        Insert: {
          config_key: string;
          config_type?: string | null;
          config_value?: Json | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          updated_at?: string | null;
          validation_schema?: Json | null;
        };
        Update: {
          config_key?: string;
          config_type?: string | null;
          config_value?: Json | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          updated_at?: string | null;
          validation_schema?: Json | null;
        };
        Relationships: [];
      };
      system_health: {
        Row: {
          alerts: Json | null;
          component_name: string;
          config_id: string | null;
          created_at: string | null;
          id: string;
          last_check: string | null;
          metrics: Json | null;
          status: string | null;
          updated_at: string | null;
          uptime_percentage: number | null;
        };
        Insert: {
          alerts?: Json | null;
          component_name: string;
          config_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_check?: string | null;
          metrics?: Json | null;
          status?: string | null;
          updated_at?: string | null;
          uptime_percentage?: number | null;
        };
        Update: {
          alerts?: Json | null;
          component_name?: string;
          config_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_check?: string | null;
          metrics?: Json | null;
          status?: string | null;
          updated_at?: string | null;
          uptime_percentage?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_health_config';
            columns: ['config_id'];
            isOneToOne: false;
            referencedRelation: 'system_configs';
            referencedColumns: ['id'];
          },
        ];
      };
      trust_factors: {
        Row: {
          category: string | null;
          created_at: string | null;
          description: string | null;
          factor_name: string;
          id: string;
          negative_impact: number | null;
          positive_impact: number | null;
          updated_at: string | null;
          weight: number | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          factor_name: string;
          id?: string;
          negative_impact?: number | null;
          positive_impact?: number | null;
          updated_at?: string | null;
          weight?: number | null;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          factor_name?: string;
          id?: string;
          negative_impact?: number | null;
          positive_impact?: number | null;
          updated_at?: string | null;
          weight?: number | null;
        };
        Relationships: [];
      };
      trust_metrics: {
        Row: {
          consistency_score: number | null;
          created_at: string | null;
          id: string;
          recovery_events: Json | null;
          reliability_score: number | null;
          safety_score: number | null;
          session_id: string;
          transparency_score: number | null;
          trust_events: Json | null;
          trust_score: number | null;
          trust_trend: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          consistency_score?: number | null;
          created_at?: string | null;
          id?: string;
          recovery_events?: Json | null;
          reliability_score?: number | null;
          safety_score?: number | null;
          session_id: string;
          transparency_score?: number | null;
          trust_events?: Json | null;
          trust_score?: number | null;
          trust_trend?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          consistency_score?: number | null;
          created_at?: string | null;
          id?: string;
          recovery_events?: Json | null;
          reliability_score?: number | null;
          safety_score?: number | null;
          session_id?: string;
          transparency_score?: number | null;
          trust_events?: Json | null;
          trust_score?: number | null;
          trust_trend?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_trust_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_trust_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics_rollups';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_trust_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'quantum_user_intelligence';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'fk_trust_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_context';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'fk_trust_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_context_rollups';
            referencedColumns: ['user_id'];
          },
        ];
      };
      trust_transparency_metrics: {
        Row: {
          builds_trust_with_dreams: boolean | null;
          comparison_id: string | null;
          concept_clarity_score: number | null;
          created_at: string | null;
          educational_value: number | null;
          emotional_resonance_score: number | null;
          id: string;
          makes_user_feel_empowered: boolean | null;
          makes_user_feel_less_alone: boolean | null;
          makes_user_feel_seen: boolean | null;
          practical_applicability: number | null;
          transparency_level: number | null;
          trust_impact_score: number | null;
          trust_moment_type: string;
        };
        Insert: {
          builds_trust_with_dreams?: boolean | null;
          comparison_id?: string | null;
          concept_clarity_score?: number | null;
          created_at?: string | null;
          educational_value?: number | null;
          emotional_resonance_score?: number | null;
          id?: string;
          makes_user_feel_empowered?: boolean | null;
          makes_user_feel_less_alone?: boolean | null;
          makes_user_feel_seen?: boolean | null;
          practical_applicability?: number | null;
          transparency_level?: number | null;
          trust_impact_score?: number | null;
          trust_moment_type: string;
        };
        Update: {
          builds_trust_with_dreams?: boolean | null;
          comparison_id?: string | null;
          concept_clarity_score?: number | null;
          created_at?: string | null;
          educational_value?: number | null;
          emotional_resonance_score?: number | null;
          id?: string;
          makes_user_feel_empowered?: boolean | null;
          makes_user_feel_less_alone?: boolean | null;
          makes_user_feel_seen?: boolean | null;
          practical_applicability?: number | null;
          transparency_level?: number | null;
          trust_impact_score?: number | null;
          trust_moment_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trust_transparency_metrics_comparison_id_fkey';
            columns: ['comparison_id'];
            isOneToOne: false;
            referencedRelation: 'sparksplit_comparisons';
            referencedColumns: ['id'];
          },
        ];
      };
      user_context: {
        Row: {
          business_goals: string[] | null;
          churn_risk: number | null;
          created_at: string | null;
          email: string | null;
          emotional_profile: Json | null;
          engagement_trend: string | null;
          id: string;
          industry_focus: string[] | null;
          lifetime_value: number | null;
          name: string | null;
          personalization_score: number | null;
          predictive_insights: Json | null;
          preferred_tone: string | null;
          spark_resonance: Json | null;
          total_sessions: number | null;
          trust_history: Json | null;
          trust_score_current: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          business_goals?: string[] | null;
          churn_risk?: number | null;
          created_at?: string | null;
          email?: string | null;
          emotional_profile?: Json | null;
          engagement_trend?: string | null;
          id?: string;
          industry_focus?: string[] | null;
          lifetime_value?: number | null;
          name?: string | null;
          personalization_score?: number | null;
          predictive_insights?: Json | null;
          preferred_tone?: string | null;
          spark_resonance?: Json | null;
          total_sessions?: number | null;
          trust_history?: Json | null;
          trust_score_current?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          business_goals?: string[] | null;
          churn_risk?: number | null;
          created_at?: string | null;
          email?: string | null;
          emotional_profile?: Json | null;
          engagement_trend?: string | null;
          id?: string;
          industry_focus?: string[] | null;
          lifetime_value?: number | null;
          name?: string | null;
          personalization_score?: number | null;
          predictive_insights?: Json | null;
          preferred_tone?: string | null;
          spark_resonance?: Json | null;
          total_sessions?: number | null;
          trust_history?: Json | null;
          trust_score_current?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      webhook_logs: {
        Row: {
          created_at: string | null;
          id: string;
          max_retries: number | null;
          payload: Json | null;
          response_body: string | null;
          response_status: number | null;
          response_time: number | null;
          retry_count: number | null;
          sent_at: string | null;
          session_id: string;
          updated_at: string | null;
          webhook_type: string | null;
          webhook_url: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          max_retries?: number | null;
          payload?: Json | null;
          response_body?: string | null;
          response_status?: number | null;
          response_time?: number | null;
          retry_count?: number | null;
          sent_at?: string | null;
          session_id: string;
          updated_at?: string | null;
          webhook_type?: string | null;
          webhook_url?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          max_retries?: number | null;
          payload?: Json | null;
          response_body?: string | null;
          response_status?: number | null;
          response_time?: number | null;
          retry_count?: number | null;
          sent_at?: string | null;
          session_id?: string;
          updated_at?: string | null;
          webhook_type?: string | null;
          webhook_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_webhook_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics';
            referencedColumns: ['session_id'];
          },
          {
            foreignKeyName: 'fk_webhook_session';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'session_analytics_rollups';
            referencedColumns: ['session_id'];
          },
        ];
      };
    };
    Views: {
      prompt_types_rollups: {
        Row: {
          average_cost_per_use: number | null;
          average_trust_score: number | null;
          id: string | null;
          prompt_type: string | null;
          total_usage_count: number | null;
        };
        Relationships: [];
      };
      quantum_performance_dashboard: {
        Row: {
          active_users_count: number | null;
          avg_emotional_resonance: number | null;
          avg_session_duration_ms: number | null;
          avg_transparency_score: number | null;
          avg_trust_evolution: number | null;
          canai_selection_rate: number | null;
          computed_at: string | null;
          dashboard_type: string | null;
          system_health_rate: number | null;
          trust_improvement_rate: number | null;
        };
        Relationships: [];
      };
      quantum_user_intelligence: {
        Row: {
          churn_risk: number | null;
          computed_at: string | null;
          emotional_analytics: Json | null;
          engagement_trend: string | null;
          next_action_prediction: Json | null;
          personalization_score: number | null;
          trust_score_current: number | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      session_analytics_rollups: {
        Row: {
          average_trust_score: number | null;
          id: string | null;
          session_id: string | null;
          total_cost: number | null;
          total_prompts: number | null;
        };
        Relationships: [];
      };
      user_context_rollups: {
        Row: {
          average_session_duration: number | null;
          average_trust_score_calculated: number | null;
          id: string | null;
          total_prompts_created: number | null;
          total_sessions_calculated: number | null;
          total_spend: number | null;
          user_id: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      binary_quantize: {
        Args: { '': string } | { '': unknown };
        Returns: unknown;
      };
      calculate_average_trust_score: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      calculate_canai_selection_rate: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      calculate_educational_impact: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      calculate_spark_resonance: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      calculate_system_uptime: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      check_performance_health: {
        Args: Record<PropertyKey, never>;
        Returns: {
          metric_name: string;
          current_value: number;
          target_value: number;
          status: string;
        }[];
      };
      deployment_health_check: {
        Args: Record<PropertyKey, never>;
        Returns: {
          component_name: string;
          status: string;
          performance_score: number;
          check_time: string;
        }[];
      };
      flatten_json_for_makecom: {
        Args: { input_json: Json };
        Returns: Json;
      };
      flatten_nested_object: {
        Args: { obj: Json; prefix: string };
        Returns: Json;
      };
      gtrgm_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { '': unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      halfvec_avg: {
        Args: { '': number[] };
        Returns: unknown;
      };
      halfvec_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      halfvec_send: {
        Args: { '': unknown };
        Returns: string;
      };
      halfvec_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      hnsw_bit_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnsw_halfvec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnsw_sparsevec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnswhandler: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflat_bit_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflat_halfvec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflathandler: {
        Args: { '': unknown };
        Returns: unknown;
      };
      l2_norm: {
        Args: { '': unknown } | { '': unknown };
        Returns: number;
      };
      l2_normalize: {
        Args: { '': string } | { '': unknown } | { '': unknown };
        Returns: unknown;
      };
      optimize_query_performance: {
        Args: Record<PropertyKey, never>;
        Returns: {
          optimization_type: string;
          before_ms: number;
          after_ms: number;
          improvement_pct: number;
        }[];
      };
      predict_emotional_state: {
        Args: { input_session_id: string };
        Returns: Json;
      };
      predict_user_next_action: {
        Args: { input_user_id: string };
        Returns: Json;
      };
      quantum_system_health: {
        Args: Record<PropertyKey, never>;
        Returns: {
          component_name: string;
          status: string;
          performance_score: number;
          last_check: string;
        }[];
      };
      set_limit: {
        Args: { '': number };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { '': string };
        Returns: string[];
      };
      sparsevec_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      sparsevec_send: {
        Args: { '': unknown };
        Returns: string;
      };
      sparsevec_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      test_quantum_performance: {
        Args: Record<PropertyKey, never>;
        Returns: {
          metric_name: string;
          performance_ms: number;
          status: string;
          target_ms: number;
        }[];
      };
      validate_airtable_base_id: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      validate_quantum_optimization: {
        Args: Record<PropertyKey, never>;
        Returns: {
          check_name: string;
          status: boolean;
          details: string;
        }[];
      };
      validate_relationship_count: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      validate_schema_integrity: {
        Args: Record<PropertyKey, never>;
        Returns: {
          check_name: string;
          status: boolean;
          details: string;
        }[];
      };
      vector_avg: {
        Args: { '': number[] };
        Returns: string;
      };
      vector_dims: {
        Args: { '': string } | { '': unknown };
        Returns: number;
      };
      vector_norm: {
        Args: { '': string };
        Returns: number;
      };
      vector_out: {
        Args: { '': string };
        Returns: unknown;
      };
      vector_send: {
        Args: { '': string };
        Returns: string;
      };
      vector_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
