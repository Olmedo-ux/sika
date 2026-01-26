<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    /**
     * Get global statistics for landing page
     */
    public function global()
    {
        // Cache global stats for 5 minutes to reduce database load
        return Cache::remember('global_stats', 300, function () {
            // Calculate total waste recycled (sum of all completed collections)
            // For now, return 0 if no data to avoid SQL errors
            $completedCollections = Collection::where('status', 'completed')->count();
            $totalWasteRecycled = 0;
            
            if ($completedCollections > 0) {
                // Try to sum quantity, fallback to 0 on error
                try {
                    $totalWasteRecycled = Collection::where('status', 'completed')
                        ->get()
                        ->sum(function($collection) {
                            return floatval(preg_replace('/[^0-9.]/', '', $collection->quantity ?? '0'));
                        });
                } catch (\Exception $e) {
                    $totalWasteRecycled = 0;
                }
            }

            // Estimate CO2 avoided (rough calculation: 1kg waste = ~0.5kg CO2)
            $co2Avoided = $totalWasteRecycled * 0.5;

            // Count families engaged (citizens)
            $familiesEngaged = User::where('role', 'citizen')->count();

            // Count active collectors
            $activeCollectors = User::where('role', 'collector')->count();

            return response()->json([
                'totalWasteRecycled' => round($totalWasteRecycled, 0),
                'co2Avoided' => round($co2Avoided, 0),
                'familiesEngaged' => $familiesEngaged,
                'activeCollectors' => $activeCollectors,
            ]);
        });
    }

    /**
     * Get dashboard statistics for authenticated user
     */
    public function dashboard()
    {
        $user = Auth::user();
        $stats = [];

        if ($user->role === 'citizen') {
            // Citizen stats
            $stats['pendingCollections'] = Collection::where('citizen_id', $user->id)
                ->whereIn('status', ['pending', 'accepted', 'in_progress'])
                ->count();

            $stats['completedThisMonth'] = Collection::where('citizen_id', $user->id)
                ->where('status', 'completed')
                ->whereMonth('completed_at', now()->month)
                ->count();

            $totalWeight = 0;
            try {
                $totalWeight = Collection::where('citizen_id', $user->id)
                    ->where('status', 'completed')
                    ->get()
                    ->sum(function($collection) {
                        return floatval(preg_replace('/[^0-9.]/', '', $collection->quantity ?? '0'));
                    });
            } catch (\Exception $e) {
                $totalWeight = 0;
            }

            $stats['totalWeight'] = round($totalWeight, 2);

            $stats['totalEarnings'] = Collection::where('citizen_id', $user->id)
                ->where('status', 'completed')
                ->sum('amount') ?? 0;

        } elseif ($user->role === 'collector') {
            // Collector stats
            $stats['pendingCollections'] = Collection::where('collector_id', $user->id)
                ->whereIn('status', ['accepted', 'in_progress'])
                ->count();

            $stats['completedThisMonth'] = Collection::where('collector_id', $user->id)
                ->where('status', 'completed')
                ->whereMonth('completed_at', now()->month)
                ->count();

            $totalWeight = 0;
            try {
                $totalWeight = Collection::where('collector_id', $user->id)
                    ->where('status', 'completed')
                    ->get()
                    ->sum(function($collection) {
                        return floatval(preg_replace('/[^0-9.]/', '', $collection->quantity ?? '0'));
                    });
            } catch (\Exception $e) {
                $totalWeight = 0;
            }

            $stats['totalWeight'] = round($totalWeight, 2);

            $stats['totalEarnings'] = 0; // Collectors don't earn from collections directly

        } elseif ($user->role === 'recycler') {
            // Recycler stats
            // TODO: Implement actual sales tracking via transactions/orders table
            // For now, sales are 0 until a transaction system is implemented
            $stats['totalSales'] = 0; // Will be count of completed marketplace transactions
            $stats['totalRevenue'] = 0; // Will be sum of completed transaction amounts

            $stats['activeProducts'] = \App\Models\MarketplaceProduct::where('seller_id', $user->id)
                ->where('available', true)
                ->count();

            $stats['totalProducts'] = \App\Models\MarketplaceProduct::where('seller_id', $user->id)
                ->count();
        }

        return response()->json($stats);
    }
}
