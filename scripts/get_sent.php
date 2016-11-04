<?php
    header('Content-Type: application/json');
    $result_array = array();
    switch($_POST['functionname']) {
        case 'call_api':
            // check for errors in call
            if(!is_array($_POST['arguments']) || (count($_POST['arguments']) < 2)) {
                $result_array['error'] = 'error';
            }
            else {
                $result_array['error'] = 'none';
                // curl for positive sentiment
           		$curl_handle_pos = curl_init();
				curl_setopt($curl_handle_pos, CURLOPT_URL, $_POST['arguments'][0]);
				curl_setopt($curl_handle_pos, CURLOPT_CONNECTTIMEOUT, 2);
				curl_setopt($curl_handle_pos, CURLOPT_RETURNTRANSFER, 1);
				$buffer_pos = curl_exec($curl_handle_pos);
				curl_close($curl_handle_pos);
                // curl for negative sentiment
                $curl_handle_neg = curl_init();
                curl_setopt($curl_handle_neg, CURLOPT_URL, $_POST['arguments'][1]);
                curl_setopt($curl_handle_neg, CURLOPT_CONNECTTIMEOUT, 2);
                curl_setopt($curl_handle_neg, CURLOPT_RETURNTRANSFER, 1);
                $buffer_neg = curl_exec($curl_handle_neg);
                curl_close($curl_handle_neg);
                // add results to array
				if (empty($buffer_pos) && empty($buffer_neg)){
                    // no results
				    $result_array['result_pos'] = '';
                    $result_array['result_neg'] = '';
				} else if (empty($buffer_pos)) {
                    // only results for negative sentiment
                    $result_array['result_pos'] = '';
                    $pieces = explode("\"", $buffer_neg);
                    $results = $pieces[4];
                    $result_array['result_neg'] = mb_substr($results, 1, strlen($results)-2);
                } else if (empty($buffer_neg)) {
                    // only results for positive sentiment
                    $result_array['result_neg'] = '';
                    $pieces = explode("\"", $buffer_pos);
                    $results = $pieces[4];
                    $result_array['result_pos'] = mb_substr($results, 1, strlen($results)-2);
                } else{
                    // complete results
					$pieces = explode("\"", $buffer_pos);
                    $results = $pieces[4];
                    $result_array['result_pos'] = mb_substr($results, 1, strlen($results)-2);
                    $pieces = explode("\"", $buffer_neg);
                    $results = $pieces[4];
                    $result_array['result_neg'] = mb_substr($results, 1, strlen($results)-2);
				}
            }
    }
    // send it
    echo json_encode($result_array);
?>