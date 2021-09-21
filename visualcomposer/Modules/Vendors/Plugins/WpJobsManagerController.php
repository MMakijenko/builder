<?php

namespace VisualComposer\Modules\Vendors\Plugins;

if (!defined('ABSPATH')) {
    header('Status: 403 Forbidden');
    header('HTTP/1.1 403 Forbidden');
    exit;
}

use VisualComposer\Framework\Container;
use VisualComposer\Framework\Illuminate\Support\Module;
use VisualComposer\Helpers\Traits\EventsFilters;
use VisualComposer\Helpers\Traits\WpFiltersActions;

/**
 * Plugin backward compatibility
 *
 * @see https://wordpress.org/plugins/wp-job-manager/
 */
class WpJobsManagerController extends Container implements Module
{
    use WpFiltersActions;
    use EventsFilters;

    public function __construct()
    {
        $this->wpAddAction('plugins_loaded', 'initialize', 16);
    }

    protected function initialize()
    {
        if (defined('JOB_MANAGER_VERSION')) {
            $this->wpAddAction(
                'job_content_start',
                function () {
                    global $post;
                    // @codingStandardsIgnoreLine
                    $post->post_content = vcfilter('vcv:frontView:content:encode', $post->post_content);
                }
            );
        }
    }
}
