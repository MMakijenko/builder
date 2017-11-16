<?php

namespace VisualComposer\Modules\Hub\TemplateTeasers;

if (!defined('ABSPATH')) {
    header('Status: 403 Forbidden');
    header('HTTP/1.1 403 Forbidden');
    exit;
}

use VisualComposer\Framework\Illuminate\Support\Module;
use VisualComposer\Helpers\File;
use VisualComposer\Helpers\Hub\Actions\HubTemplatesBundle;
use VisualComposer\Helpers\Hub\Templates;
use VisualComposer\Helpers\Logger;
use VisualComposer\Helpers\Traits\EventsFilters;
use VisualComposer\Modules\Editors\Templates\TemplatesDownloadController;
use WP_Query;

class TemplatesUpdater extends TemplatesDownloadController implements Module
{
    use EventsFilters;

    public function __construct()
    {
        if (vcvenv('VCV_HUB_DOWNLOAD_SINGLE_TEMPLATE')) {
            $this->addFilter('vcv:hub:download:bundle vcv:hub:download:bundle:template/*', 'updateTemplate');
        }
    }

    protected function updateTemplate(
        $response,
        $payload,
        Logger $loggerHelper,
        File $fileHelper,
        Templates $hubTemplatesHelper,
        HubTemplatesBundle $hubTemplatesBundleHelper
    ) {
        $bundleJson = isset($payload['archive']) ? $payload['archive'] : false;
        if (vcIsBadResponse($response) || !$bundleJson || is_wp_error($bundleJson)) {
            $loggerHelper->log(
                __('Failed to update elements', 'vcwb'),
                [
                    'response' => $response,
                    'bundleJson' => $bundleJson,
                ]
            );

            return ['status' => false];
        }
        // TODO: Save hub template
        // TODO: Return template data (content)
        // SEE: \VisualComposer\Modules\Editors\Templates\TemplatesDownloadController::updateTemplates
        if (!isset($response['templates']) || empty($response['templates'])) {
            $response['templates'] = [];
        }

        $fileHelper->createDirectory(
            $hubTemplatesHelper->getTemplatesPath()
        );
        $template = $bundleJson;
        // File is locally available
        $tempTemplatePath = $hubTemplatesBundleHelper->getTempBundleFolder('templates/' . $template['id']);
        if (is_dir($tempTemplatePath)) {
            // We have local assets for template, so we need to copy them to real templates folder
            $fileHelper->createDirectory($hubTemplatesHelper->getTemplatesPath($template['id']));
            $fileHelper->copyDirectory(
                $tempTemplatePath,
                $hubTemplatesHelper->getTemplatesPath($template['id'])
            );
        }

        $templateMeta = $this->processTemplateMetaImages(
            [
                'id' => $template['id'],
                'preview' => $payload['actionData']['data']['preview'],
                'thumbnail' => $payload['actionData']['data']['thumbnail'],
            ]
        );
        $templateElements = json_decode(
            str_replace(
                '[publicPath]',
                $hubTemplatesHelper->getTemplatesUrl($template['id']),
                json_encode($template['data'])
            ),
            true
        );
        $elementsImages = $this->getTemplateElementImages($template['data']);
        foreach ($elementsImages as $element) {
            foreach ($element['images'] as $image) {
                if (isset($image['complex']) && $image['complex']) {
                    $imageData = $this->processWpMedia(
                        $image,
                        $template,
                        $element['elementId'] . '-' . $image['key'] . '-'
                    );
                } else {
                    // it is simple url
                    $imageData = $this->processSimple(
                        $image['url'],
                        $template,
                        $element['elementId'] . '-' . $image['key'] . '-'
                    );
                }

                if (!is_wp_error($imageData) && $imageData) {
                    $templateElements[ $element['elementId'] ][ $image['key'] ] = $imageData;
                }
            }
        }
        $templateElements = $this->processDesignOptions($templateElements, $template);
        unset($template['data']);

        $savedTemplates = new WP_Query(
            [
                'post_type' => 'vcv_templates',
                'meta_query' => [
                    [
                        'key' => '_' . VCV_PREFIX . 'id',
                        'value' => $template['id'],
                        'compare' => '=',
                    ],
                ],
            ]
        );

        if (!$savedTemplates->have_posts()) {
            $templateId = wp_insert_post(
                [
                    'post_title' => $template['name'],
                    'post_type' => 'vcv_templates',
                    'post_status' => 'publish',
                ]
            );
        } else {
            $savedTemplates->the_post();
            $templateId = get_the_ID();
            wp_reset_postdata();
            wp_update_post(
                [
                    'ID' => $templateId,
                    'post_title' => $payload['actionData']['data']['name'],
                    'post_type' => 'vcv_templates',
                    'post_status' => 'publish',
                ]
            );
        }
        $template['description'] = $payload['actionData']['data']['description'];
        $template['thumbnail'] = $templateMeta['thumbnail'];
        $template['preview'] = $templateMeta['preview'];
        $template['type'] = 'hub';
        update_post_meta($templateId, '_' . VCV_PREFIX . 'description', $template['description']);
        update_post_meta($templateId, '_' . VCV_PREFIX . 'type', $template['type']);
        update_post_meta($templateId, '_' . VCV_PREFIX . 'thumbnail', $template['thumbnail']);
        update_post_meta($templateId, '_' . VCV_PREFIX . 'preview', $template['preview']);
        update_post_meta($templateId, '_' . VCV_PREFIX . 'id', $template['id']);
        update_post_meta($templateId, 'vcvEditorTemplateElements', $templateElements);

        $response['templates'][] = [
            'id' => $templateId,
            'content' => $templateElements,
            'thumbnailUrl' => $template['thumbnail'],
            'previewUrl' => $template['preview'],
        ];

        return $response;
    }
}
